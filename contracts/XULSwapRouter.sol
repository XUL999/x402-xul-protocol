// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "./XULSwapFactory.sol";

/**
 * @title XULSwapRouter
 * @notice Router for interacting with XULSwap DEX
 */
contract XULSwapRouter {
    address public factory;
    address public WXUL;
    
    constructor(address _factory, address _WXUL) {
        factory = _factory;
        WXUL = _WXUL;
    }
    
    // Add liquidity
    function addLiquidity(
        address tokenA,
        address tokenB,
        uint256 amountADesired,
        uint256 amountBDesired,
        uint256 amountAMin,
        uint256 amountBMin,
        address to,
        uint256 deadline
    ) external returns (uint256 amountA, uint256 amountB, uint256 liquidity) {
        (address token0, address token1) = tokenA < tokenB ? (tokenA, tokenB) : (tokenB, tokenA);
        
        // Create pair if doesn't exist
        address pair = XULSwapFactory(factory).getPair(token0, token1);
        if (pair == address(0)) {
            XULSwapFactory(factory).createPair(token0, token1);
            pair = XULSwapFactory(factory).getPair(token0, token1);
        }
        
        // Transfer tokens
        IERC20(tokenA).transferFrom(msg.sender, pair, amountADesired);
        IERC20(tokenB).transferFrom(msg.sender, pair, amountBDesired);
        
        // Mint liquidity
        liquidity = XULSwapPair(pair).mint(to);
        
        return (amountADesired, amountBDesired, liquidity);
    }
    
    // Remove liquidity
    function removeLiquidity(
        address tokenA,
        address tokenB,
        uint256 liquidity,
        uint256 amountAMin,
        uint256 amountBMin,
        address to,
        uint256 deadline
    ) external returns (uint256 amountA, uint256 amountB) {
        (address token0, address token1) = tokenA < tokenB ? (tokenA, tokenB) : (tokenB, tokenA);
        address pair = XULSwapFactory(factory).getPair(token0, token1);
        
        IERC20(pair).transferFrom(msg.sender, pair, liquidity);
        (amountA, amountB) = XULSwapPair(pair).burn(to);
        
        return (amountA, amountB);
    }
    
    // Swap tokens
    function swapExactTokensForTokens(
        uint256 amountIn,
        uint256 amountOutMin,
        address[] calldata path,
        address to,
        uint256 deadline
    ) external returns (uint256[] memory amounts) {
        amounts = new uint256[](path.length);
        amounts[0] = amountIn;
        
        for (uint256 i = 0; i < path.length - 1; i++) {
            (address input, address output) = (path[i], path[i + 1]);
            (address token0, ) = input < output ? (input, output) : (output, input);
            address pair = XULSwapFactory(factory).getPair(token0, output);
            
            uint256 amountOut = getAmountOut(amounts[i], pair);
            amounts[i + 1] = amountOut;
            
            (uint256 amount0Out, uint256 amount1Out) = input == token0 ? (uint256(0), amountOut) : (amountOut, uint256(0));
            IERC20(input).transferFrom(msg.sender, pair, amounts[i]);
            XULSwapPair(pair).swap(amount0Out, amount1Out, to);
        }
        
        return amounts;
    }
    
    function getAmountOut(uint256 amountIn, address pair) public view returns (uint256) {
        (uint256 reserve0, uint256 reserve1, ) = XULSwapPair(pair).getReserves();
        require(reserve0 > 0 && reserve1 > 0, "INSUFFICIENT_LIQUIDITY");
        
        uint256 amountInWithFee = amountIn * 997;
        uint256 numerator = amountInWithFee * reserve1;
        uint256 denominator = (reserve0 * 1000) + amountInWithFee;
        
        return numerator / denominator;
    }
    
    // Get amounts out
    function getAmountsOut(uint256 amountIn, address[] memory path) public view returns (uint256[] memory) {
        uint256[] memory amounts = new uint256[](path.length);
        amounts[0] = amountIn;
        
        for (uint256 i = 0; i < path.length - 1; i++) {
            (address input, address output) = (path[i], path[i + 1]);
            (address token0, ) = input < output ? (input, output) : (output, input);
            address pair = XULSwapFactory(factory).getPair(token0, output);
            amounts[i + 1] = getAmountOut(amounts[i], pair);
        }
        
        return amounts;
    }
}


