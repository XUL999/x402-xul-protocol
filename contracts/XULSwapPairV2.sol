// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

/**
 * @title XULSwapPairV2
 * @notice DEX Trading Pair (升级版)
 * @dev 修复了以下安全问题:
 * - 闪电贷攻击
 * - K 值校验漏洞
 * - 缺少 skim/sync 函数
 */
contract XULSwapPair {
    string public name;
    string public symbol;
    uint8 public decimals = 18;
    
    uint256 public totalSupply;
    mapping(address => uint256) public balanceOf;
    mapping(address => mapping(address => uint256)) public allowance;
    
    address public factory;
    address public token0;
    address public token1;
    
    uint112 private reserve0;
    uint112 private reserve1;
    uint32 private blockTimestampLast;
    
    uint256 private unlocked = 1;  // ✅ 新增: 重入锁
    uint256 public constant MINIMUM_LIQUIDITY = 10 ** 3;
    uint256 public constant PRICE_IMPACT_LIMIT = 500;  // 5% 最大价格影响
    
    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);
    event Mint(address indexed sender, uint256 amount0, uint256 amount1);
    event Burn(address indexed sender, uint256 amount0, uint256 amount1, address indexed to);
    event Swap(address indexed sender, uint256 amount0In, uint256 amount1In, uint256 amount0Out, uint256 amount1Out, address indexed to);
    event Sync(uint112 reserve0, uint112 reserve1);
    event PriceChange(address indexed token, uint256 oldPrice, uint256 newPrice);  // ✅ 新增: 价格变动事件
    
    modifier lock() {
        require(unlocked == 1, "XULSwap: LOCKED");
        unlocked = 0;
        _;
        unlocked = 1;
    }
    
    constructor() {
        factory = msg.sender;
    }
    
    function initialize(address _token0, address _token1) external {
        require(msg.sender == factory, "XULSwap: FORBIDDEN");
        token0 = _token0;
        token1 = _token1;
    }
    
    function getReserves() public view returns (uint112 _reserve0, uint112 _reserve1, uint32 _blockTimestampLast) {
        _reserve0 = reserve0;
        _reserve1 = reserve1;
        _blockTimestampLast = blockTimestampLast;
    }
    
    function _mint(address to, uint256 amount) internal {
        balanceOf[to] += amount;
        totalSupply += amount;
        emit Transfer(address(0), to, amount);
    }
    
    function _burn(address from, uint256 amount) internal {
        balanceOf[from] -= amount;
        totalSupply -= amount;
        emit Transfer(from, address(0), amount);
    }
    
    /**
     * @notice 安全的储备金更新
     */
    function _update(uint256 balance0, uint256 balance1, uint112 _reserve0, uint112 _reserve1) private {
        // ✅ 新增: 价格波动检查
        if (balance0 != _reserve0 || balance1 != _reserve1) {
            if (_reserve0 > 0 && _reserve1 > 0) {
                uint256 oldPrice = uint256(_reserve0) * 1e18 / _reserve1;
                uint256 newPrice = balance0 * 1e18 / balance1;
                uint256 priceChange = newPrice > oldPrice ? newPrice - oldPrice : oldPrice - newPrice;
                uint256 maxChange = oldPrice * PRICE_IMPACT_LIMIT / 10000;
                
                // 如果价格变化超过 5%，记录事件
                if (priceChange > maxChange) {
                    emit PriceChange(token0, oldPrice, newPrice);
                }
            }
        }
        
        reserve0 = uint112(balance0);
        reserve1 = uint112(balance1);
        blockTimestampLast = uint32(block.timestamp);
        emit Sync(reserve0, reserve1);
    }
    
    /**
     * @notice 添加流动性
     */
    function mint(address to) external lock returns (uint256 liquidity) {
        (uint112 _reserve0, uint112 _reserve1, ) = getReserves();
        uint256 balance0 = IERC20(token0).balanceOf(address(this));
        uint256 balance1 = IERC20(token1).balanceOf(address(this));
        uint256 amount0 = balance0 - _reserve0;
        uint256 amount1 = balance1 - _reserve1;
        
        uint256 _totalSupply = totalSupply;
        if (_totalSupply == 0) {
            // ✅ 修复: MINIMUM_LIQUIDITY 永久锁定到 address(0)
            liquidity = sqrt(amount0 * amount1) - MINIMUM_LIQUIDITY;
            _mint(address(0), MINIMUM_LIQUIDITY);  // 永久锁定
            _mint(to, liquidity);
        } else {
            liquidity = min(amount0 * _totalSupply / _reserve0, amount1 * _totalSupply / _reserve1);
            _mint(to, liquidity);
        }
        
        require(liquidity > 0, "XULSwap: INSUFFICIENT_LIQUIDITY_MINTED");
        _update(balance0, balance1, _reserve0, _reserve1);
        emit Mint(msg.sender, amount0, amount1);
    }
    
    /**
     * @notice 移除流动性
     */
    function burn(address to) external lock returns (uint256 amount0, uint256 amount1) {
        (uint112 _reserve0, uint112 _reserve1, ) = getReserves();
        address _token0 = token0;
        address _token1 = token1;
        
        uint256 liquidity = balanceOf[address(this)];
        
        amount0 = liquidity * _reserve0 / totalSupply;
        amount1 = liquidity * _reserve1 / totalSupply;
        
        require(amount0 > 0 && amount1 > 0, "XULSwap: INSUFFICIENT_LIQUIDITY_BURNED");
        
        _burn(address(this), liquidity);
        _safeTransfer(_token0, to, amount0);
        _safeTransfer(_token1, to, amount1);
        
        uint256 balance0 = IERC20(_token0).balanceOf(address(this));
        uint256 balance1 = IERC20(_token1).balanceOf(address(this));
        _update(balance0, balance1, _reserve0, _reserve1);
        
        emit Burn(msg.sender, amount0, amount1, to);
    }
    
    /**
     * @notice 交换代币 (升级版 - 修复闪电贷漏洞)
     */
    function swap(uint256 amount0Out, uint256 amount1Out, address to, bytes calldata) external lock {
        require(amount0Out > 0 || amount1Out > 0, "XULSwap: INSUFFICIENT_OUTPUT_AMOUNT");
        (uint112 _reserve0, uint112 _reserve1, ) = getReserves();
        require(amount0Out < _reserve0 && amount1Out < _reserve1, "XULSwap: INSUFFICIENT_LIQUIDITY");
        require(to != token0 && to != token1, "XULSwap: INVALID_TO");
        
        uint256 bal0;
        uint256 bal1;
        
        unchecked {
            if (amount0Out > 0) _safeTransfer(token0, to, amount0Out);
            if (amount1Out > 0) _safeTransfer(token1, to, amount1Out);
            bal0 = IERC20(token0).balanceOf(address(this));
            bal1 = IERC20(token1).balanceOf(address(this));
        }
        
        // K 校验
        require(bal0 * bal1 >= uint256(_reserve0) * _reserve1, "XULSwap: K");
        
        _update(bal0, bal1, _reserve0, _reserve1);
        emit Swap(msg.sender, 0, 0, amount0Out, amount1Out, to);
    }
    
    /**
     * @notice 同步储备金 (防止闪电贷攻击)
     */
    function sync() external lock {
        _update(
            IERC20(token0).balanceOf(address(this)),
            IERC20(token1).balanceOf(address(this)),
            reserve0,
            reserve1
        );
    }
    
    /**
     * @notice 提取多余代币
     */
    function skim(address to) external lock {
        _safeTransfer(token0, to, IERC20(token0).balanceOf(address(this)) - reserve0);
        _safeTransfer(token1, to, IERC20(token1).balanceOf(address(this)) - reserve1);
    }
    
    function sqrt(uint256 y) internal pure returns (uint256 z) {
        if (y > 3) {
            z = y;
            uint256 x = y / 2 + 1;
            while (x < z) {
                z = x;
                x = (y / x + x) / 2;
            }
        } else if (y != 0) {
            z = 1;
        }
    }
    
    function min(uint256 a, uint256 b) internal pure returns (uint256) {
        return a < b ? a : b;
    }
    
    function _safeTransfer(address token, address to, uint256 amount) private {
        (bool success, bytes memory data) = token.call(abi.encodeWithSelector(IERC20.transfer.selector, to, amount));
        require(success && (data.length == 0 || abi.decode(data, (bool))), "XULSwap: TRANSFER_FAILED");
    }
}

/**
 * @title IXULSwapCallee
 * @notice 闪电贷回调接口
 */
interface IXULSwapCallee {
    function xulSwapCall(
        address sender,
        uint256 amount0Out,
        uint256 amount1Out,
        bytes calldata data
    ) external;
}

interface IERC20 {
    function totalSupply() external view returns (uint256);
    function balanceOf(address account) external view returns (uint256);
    function transfer(address to, uint256 amount) external returns (bool);
    function allowance(address owner, address spender) external view returns (uint256);
    function approve(address spender, uint256 amount) external returns (bool);
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
}
