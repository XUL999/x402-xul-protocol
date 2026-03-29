// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title WXULV2 - Wrapped XUL Token (升级版)
 * @notice ERC20 wrapper for native XUL token
 * @dev 修复了以下安全问题:
 * - 添加暂停功能 (Pausable)
 * - 添加转账限额
 * - 添加黑名单功能
 */
contract WXULV2 is Pausable, Ownable {
    
    string public name = "Wrapped XUL";
    string public symbol = "WXUL";
    uint8 public decimals = 18;
    
    uint256 public totalSupply;
    
    mapping(address => uint256) public balanceOf;
    mapping(address => mapping(address => uint256)) public allowance;
    
    // ✅ 新增: 黑名单
    mapping(address => bool) public isBlacklisted;
    
    // ✅ 新增: 转账限额
    mapping(address => bool) public isExcludedFromLimit;
    mapping(address => uint256) public transferLimit;
    uint256 public globalTransferLimit = 1000000 ether;
    
    // ✅ 新增: 转账计数器 (用于速率限制)
    mapping(address => uint256) public lastTransferTime;
    mapping(address => uint256) public transferCooldown;
    
    event Deposit(address indexed to, uint256 amount);
    event Withdrawal(address indexed from, uint256 amount);
    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);
    event BlacklistAdded(address indexed account);
    event BlacklistRemoved(address indexed account);
    event TransferLimitUpdated(address indexed account, uint256 newLimit);
    event GlobalTransferLimitUpdated(uint256 newLimit);
    event CooldownUpdated(address indexed account, uint256 newCooldown);
    
    constructor() Ownable() {
        isExcludedFromLimit[msg.sender] = true;
    }
    
    modifier notBlacklisted(address account) {
        require(!isBlacklisted[account], "WXUL: BLACKLISTED");
        _;
    }
    
    receive() external payable whenNotPaused {
        deposit();
    }
    
    function deposit() public payable whenNotPaused {
        balanceOf[msg.sender] += msg.value;
        totalSupply += msg.value;
        emit Deposit(msg.sender, msg.value);
        emit Transfer(address(0), msg.sender, msg.value);
    }
    
    function withdraw(uint256 amount) public notBlacklisted(msg.sender) {
        require(balanceOf[msg.sender] >= amount, "WXUL: INSUFFICIENT_BALANCE");
        
        // ✅ 新增: cooldown 检查
        if (transferCooldown[msg.sender] > 0 && !isExcludedFromLimit[msg.sender]) {
            require(
                block.timestamp >= lastTransferTime[msg.sender] + transferCooldown[msg.sender],
                "WXUL: COOLDOWN_ACTIVE"
            );
        }
        
        balanceOf[msg.sender] -= amount;
        totalSupply -= amount;
        
        (bool success, ) = payable(msg.sender).call{value: amount}("");
        require(success, "WXUL: TRANSFER_FAILED");
        
        lastTransferTime[msg.sender] = block.timestamp;
        emit Withdrawal(msg.sender, amount);
        emit Transfer(msg.sender, address(0), amount);
    }
    
    function transfer(address to, uint256 amount) public notBlacklisted(msg.sender) notBlacklisted(to) whenNotPaused returns (bool) {
        _transfer(msg.sender, to, amount);
        return true;
    }
    
    function approve(address spender, uint256 amount) public whenNotPaused returns (bool) {
        require(!isBlacklisted[msg.sender] && !isBlacklisted[spender], "WXUL: BLACKLISTED");
        allowance[msg.sender][spender] = amount;
        emit Approval(msg.sender, spender, amount);
        return true;
    }
    
    function transferFrom(address from, address to, uint256 amount) public notBlacklisted(from) notBlacklisted(to) whenNotPaused returns (bool) {
        require(allowance[from][msg.sender] >= amount, "WXUL: INSUFFICIENT_ALLOWANCE");
        _transfer(from, to, amount);
        allowance[from][msg.sender] -= amount;
        return true;
    }
    
    function _transfer(address from, address to, uint256 amount) internal {
        require(balanceOf[from] >= amount, "WXUL: INSUFFICIENT_BALANCE");
        require(to != address(0), "WXUL: ZERO_ADDRESS");
        
        // ✅ 新增: 转账限额检查
        if (!isExcludedFromLimit[from]) {
            uint256 limit = transferLimit[from] > 0 ? transferLimit[from] : globalTransferLimit;
            require(amount <= limit, "WXUL: EXCEEDS_LIMIT");
        }
        
        // ✅ 新增: cooldown 检查
        if (transferCooldown[from] > 0 && !isExcludedFromLimit[from]) {
            require(
                block.timestamp >= lastTransferTime[from] + transferCooldown[from],
                "WXUL: COOLDOWN_ACTIVE"
            );
        }
        
        balanceOf[from] -= amount;
        balanceOf[to] += amount;
        lastTransferTime[from] = block.timestamp;
        
        emit Transfer(from, to, amount);
    }
    
    // ============ 管理员功能 ============
    
    /**
     * @notice 添加黑名单
     */
    function addBlacklist(address account) external onlyOwner {
        require(!isBlacklisted[account], "WXUL: ALREADY_BLACKLISTED");
        isBlacklisted[account] = true;
        emit BlacklistAdded(account);
    }
    
    /**
     * @notice 移除黑名单
     */
    function removeBlacklist(address account) external onlyOwner {
        require(isBlacklisted[account], "WXUL: NOT_BLACKLISTED");
        isBlacklisted[account] = false;
        emit BlacklistRemoved(account);
    }
    
    /**
     * @notice 设置个人转账限额
     */
    function setTransferLimit(address account, uint256 limit) external onlyOwner {
        transferLimit[account] = limit;
        emit TransferLimitUpdated(account, limit);
    }
    
    /**
     * @notice 设置全局转账限额
     */
    function setGlobalTransferLimit(uint256 limit) external onlyOwner {
        globalTransferLimit = limit;
        emit GlobalTransferLimitUpdated(limit);
    }
    
    /**
     * @notice 设置转账冷却时间
     */
    function setCooldown(address account, uint256 cooldown) external onlyOwner {
        transferCooldown[account] = cooldown;
        emit CooldownUpdated(account, cooldown);
    }
    
    /**
     * @notice 排除/包含账户的限额
     */
    function setExcludedFromLimit(address account, bool excluded) external onlyOwner {
        isExcludedFromLimit[account] = excluded;
    }
    
    /**
     * @notice 暂停合约 (紧急)
     */
    function pause() external onlyOwner whenNotPaused {
        _pause();
    }
    
    /**
     * @notice 取消暂停
     */
    function unpause() external onlyOwner whenPaused {
        _unpause();
    }
    
    /**
     * @notice 紧急提取合约中的代币
     */
    function emergencyWithdraw(IERC20 token, uint256 amount) external onlyOwner {
        require(token.transfer(msg.sender, amount), "WXUL: TRANSFER_FAILED");
    }
}

interface IERC20 {
    function totalSupply() external view returns (uint256);
    function balanceOf(address account) external view returns (uint256);
    function transfer(address to, uint256 amount) external returns (bool);
    function allowance(address owner, address spender) external view returns (uint256);
    function approve(address spender, uint256 amount) external returns (bool);
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
}
