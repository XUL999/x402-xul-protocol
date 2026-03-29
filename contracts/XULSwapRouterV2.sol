// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "./XULSwapPairV2.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

interface XULSwapFactory {
    function getPair(address tokenA, address tokenB) external view returns (address);
    function createPair(address tokenA, address tokenB) external returns (address);
    function feeToSetter() external view returns (address);
}

/**
 * @title XULSwapRouterV2
 * @notice Router for interacting with XULSwap DEX (升级版)
 * @dev 修复了以下安全问题:
 * - 缺少 deadline 检查
 * - 缺少滑点保护
 * - 缺少紧急暂停
 */
contract XULSwapRouter {
    address public immutable factory;
    address public immutable WXUL;
    
    // ✅ 新增: 紧急暂停
    bool public paused;
    
    // ✅ 新增: 最大滑点 (默认 0.5%)
    uint256 public maxSlippage = 50; // 50 = 0.5%
    
    event RouterPaused();
    event RouterUnpaused();
    event MaxSlippageUpdated(uint256 newMaxSlippage);
    
    modifier whenNotPaused() {
        require(!paused, "Router is paused");
        _;
    }
    
    constructor(address _factory, address _WXUL) {
        factory = _factory;
        WXUL = _WXUL;
    }
    
    /**
     * @notice 添加流动性 (升级版 - 带 deadline 和滑点保护)
     */
    function addLiquidity(
        address tokenA,
        address tokenB,
        uint256 amountADesired,
        uint256 amountBDesired,
        uint256 amountAMin,
        uint256 amountBMin,
        address to,
        uint256 deadline
    ) external whenNotPaused returns (uint256 amountA, uint256 amountB, uint256 liquidity) {
        require(deadline >= block.timestamp, "XULSwap: EXPIRED");
        
        (address token0, address token1) = tokenA < tokenB ? (tokenA, tokenB) : (tokenB, tokenA);
        
        address pair = XULSwapFactory(factory).getPair(token0, token1);
        if (pair == address(0)) {
            XULSwapFactory(factory).createPair(token0, token1);
            pair = XULSwapFactory(factory).getPair(token0, token1);
        }
        
        (uint112 reserve0, uint112 reserve1, ) = XULSwapPair(pair).getReserves();
        
        if (IERC20(pair).totalSupply() > 0) {
            uint256 optB = quote(amountADesired, reserve0, reserve1);
            if (optB <= amountBDesired) {
                require(optB >= amountBMin, "XULSwap: INSUFFICIENT_B_AMOUNT");
                amountA = amountADesired;
                amountB = optB;
            } else {
                uint256 optA = quote(amountBDesired, reserve1, reserve0);
                require(optA <= amountADesired && optA >= amountAMin, "XULSwap: INVALID_AMOUNT");
                amountA = optA;
                amountB = amountBDesired;
            }
        } else {
            require(amountADesired >= amountAMin && amountBDesired >= amountBMin, "XULSwap: INSUFFICIENT_AMOUNT");
            amountA = amountADesired;
            amountB = amountBDesired;
        }
        
        IERC20(tokenA).transferFrom(msg.sender, pair, amountA);
        IERC20(tokenB).transferFrom(msg.sender, pair, amountB);
        liquidity = XULSwapPair(pair).mint(to);
    }
    
    /**
     * @notice 移除流动性 (升级版 - 带 deadline)
     */
    function removeLiquidity(
        address tokenA,
        address tokenB,
        uint256 liquidity,
        uint256 amountAMin,
        uint256 amountBMin,
        address to,
        uint256 deadline
    ) external whenNotPaused returns (uint256 amountA, uint256 amountB) {
        // ✅ 修复: deadline 检查
        require(deadline >= block.timestamp, "XULSwap: EXPIRED");
        
        (address token0, address token1) = tokenA < tokenB ? (tokenA, tokenB) : (tokenB, tokenA);
        address pair = XULSwapFactory(factory).getPair(token0, token1);
        
        // 转账 LP 代币
        IERC20(pair).transferFrom(msg.sender, pair, liquidity);
        (amountA, amountB) = XULSwapPair(pair).burn(to);
        
        // 滑点检查
        require(amountA >= amountAMin, "XULSwap: INSUFFICIENT_A_OUTPUT");
        require(amountB >= amountBMin, "XULSwap: INSUFFICIENT_B_OUTPUT");
    }
    
    /**
     * @notice 交换代币 (升级版 - 完整安全检查)
     */
    function swapExactTokensForTokens(
        uint256 amountIn,
        uint256 amountOutMin,
        address[] calldata path,
        address to,
        uint256 deadline
    ) external whenNotPaused returns (uint256[] memory amounts) {
        // ✅ 修复: deadline 检查
        require(deadline >= block.timestamp, "XULSwap: EXPIRED");
        
        amounts = new uint256[](path.length);
        amounts[0] = amountIn;
        
        for (uint256 i = 0; i < path.length - 1; i++) {
            (address input, address output) = (path[i], path[i + 1]);
            (address token0, ) = input < output ? (input, output) : (output, input);
            address pair = XULSwapFactory(factory).getPair(token0, output);
            
            uint256 amountOut = getAmountOut(amounts[i], pair);
            amounts[i + 1] = amountOut;
            
            (uint256 amount0Out, uint256 amount1Out) = input == token0 
                ? (uint256(0), amountOut) 
                : (amountOut, uint256(0));
            
            IERC20(input).transferFrom(msg.sender, pair, amounts[i]);
            XULSwapPair(pair).swap(amount0Out, amount1Out, to, "");
        }
        
        // ✅ 新增: 输出金额检查
        require(amounts[amounts.length - 1] >= amountOutMin, "XULSwap: INSUFFICIENT_OUTPUT");
    }
    
    /**
     * @notice 计算输出金额 (带滑点保护)
     */
    function getAmountOut(uint256 amountIn, address pair) public view returns (uint256) {
        (uint256 reserve0, uint256 reserve1, ) = XULSwapPair(pair).getReserves();
        require(reserve0 > 0 && reserve1 > 0, "XULSwap: INSUFFICIENT_LIQUIDITY");
        
        uint256 amountInWithFee = amountIn * 997;
        uint256 numerator = amountInWithFee * reserve1;
        uint256 denominator = reserve0 * 1000 + amountInWithFee;
        
        return numerator / denominator;
    }
    
    /**
     * @notice 计算输出金额 (带滑点限制检查)
     */
    function getAmountOutWithSlippage(uint256 amountIn, address pair) external view returns (uint256, uint256) {
        (uint256 reserve0, uint256 reserve1, ) = XULSwapPair(pair).getReserves();
        uint256 amountOut = getAmountOut(amountIn, pair);
        
        // 计算最大允许滑点
        uint256 minAmount = amountOut * (10000 - maxSlippage) / 10000;
        
        return (amountOut, minAmount);
    }
    
    /**
     * @notice 获取路径输出金额
     */
    function getAmountsOut(uint256 amountIn, address[] memory path) public view returns (uint256[] memory) {
        uint256[] memory amounts = new uint256[](path.length);
        amounts[0] = amountIn;
        
        for (uint256 i = 0; i < path.length - 1; i++) {
            amounts[i + 1] = getAmountOut(amounts[i], XULSwapFactory(factory).getPair(
                path[i] < path[i + 1] ? path[i] : path[i + 1],
                path[i] < path[i + 1] ? path[i + 1] : path[i]
            ));
        }
        
        return amounts;
    }
    
    /**
     * @notice 报价函数
     */
    function quote(uint256 amountA, uint256 reserveA, uint256 reserveB) public pure returns (uint256) {
        require(amountA > 0, "XULSwap: INSUFFICIENT_AMOUNT");
        require(reserveA > 0 && reserveB > 0, "XULSwap: INSUFFICIENT_LIQUIDITY");
        return amountA * reserveB / reserveA;
    }
    
    // ✅ 新增: 紧急暂停 (仅管理员)
    function pause() external {
        require(msg.sender == XULSwapFactory(factory).feeToSetter(), "XULSwap: FORBIDDEN");
        paused = true;
        emit RouterPaused();
    }
    
    function unpause() external {
        require(msg.sender == XULSwapFactory(factory).feeToSetter(), "XULSwap: FORBIDDEN");
        paused = false;
        emit RouterUnpaused();
    }
    
    // ✅ 新增: 更新最大滑点
    function updateMaxSlippage(uint256 newMaxSlippage) external {
        require(msg.sender == XULSwapFactory(factory).feeToSetter(), "XULSwap: FORBIDDEN");
        require(newMaxSlippage <= 1000, "XULSwap: SLIPPAGE_TOO_HIGH"); // 最大 10%
        maxSlippage = newMaxSlippage;
        emit MaxSlippageUpdated(newMaxSlippage);
    }
}


