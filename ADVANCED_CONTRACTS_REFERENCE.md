# XUL Chain 先进合约参考库

## 🎯 推荐实现的合约

### 1. Staking 合约 (参考 Lido)

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/**
 * @title XULStaking
 * @notice 质押 XUL 获得 sXUL，参与 DAO 治理
 */
contract XULStaking is ERC20, Ownable, ReentrancyGuard {
    
    IERC20 public immutable xulToken;
    
    uint256 public totalStaked;
    uint256 public rewardRate = 1000; // 10% APY
    
    mapping(address => uint256) public stakedAmount;
    mapping(address => uint256) public lastRewardTime;
    
    event Staked(address indexed user, uint256 amount);
    event Unstaked(address indexed user, uint256 amount);
    event RewardClaimed(address indexed user, uint256 reward);
    
    constructor(address _xulToken) ERC20("Staked XUL", "sXUL") {
        xulToken = IERC20(_xulToken);
    }
    
    /**
     * @notice 质押 XUL
     */
    function stake(uint256 amount) external nonReentrant {
        require(amount > 0, "Amount must be > 0");
        
        // 转账 XUL 到合约
        xulToken.transferFrom(msg.sender, address(this), amount);
        
        // 更新质押信息
        stakedAmount[msg.sender] += amount;
        totalStaked += amount;
        lastRewardTime[msg.sender] = block.timestamp;
        
        // 铸造 sXUL
        _mint(msg.sender, amount);
        
        emit Staked(msg.sender, amount);
    }
    
    /**
     * @notice 取消质押
     */
    function unstake(uint256 amount) external nonReentrant {
        require(stakedAmount[msg.sender] >= amount, "Insufficient staked");
        
        // 计算奖励
        uint256 reward = calculateReward(msg.sender);
        if (reward > 0) {
            xulToken.transfer(msg.sender, reward);
            emit RewardClaimed(msg.sender, reward);
        }
        
        // 更新质押信息
        stakedAmount[msg.sender] -= amount;
        totalStaked -= amount;
        
        // 销毁 sXUL
        _burn(msg.sender, amount);
        
        // 返还 XUL
        xulToken.transfer(msg.sender, amount);
        
        emit Unstaked(msg.sender, amount);
    }
    
    /**
     * @notice 计算奖励
     */
    function calculateReward(address user) public view returns (uint256) {
        uint256 timeStaked = block.timestamp - lastRewardTime[user];
        uint256 reward = (stakedAmount[user] * rewardRate * timeStaked) / (365 days * 10000);
        return reward;
    }
    
    /**
     * @notice 领取奖励
     */
    function claimReward() external nonReentrant {
        uint256 reward = calculateReward(msg.sender);
        require(reward > 0, "No reward");
        
        lastRewardTime[msg.sender] = block.timestamp;
        xulToken.transfer(msg.sender, reward);
        
        emit RewardClaimed(msg.sender, reward);
    }
}
```

---

### 2. Governance 合约 (参考 Compound)

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/governance/Governor.sol";
import "@openzeppelin/contracts/governance/extensions/GovernorSettings.sol";
import "@openzeppelin/contracts/governance/extensions/GovernorCountingSimple.sol";
import "@openzeppelin/contracts/governance/extensions/GovernorVotes.sol";
import "@openzeppelin/contracts/governance/extensions/GovernorVotesQuorumFraction.sol";
import "@openzeppelin/contracts/governance/extensions/GovernorTimelockControl.sol";

/**
 * @title XULGovernor
 * @notice XUL Chain DAO 治理合约
 */
contract XULGovernor is 
    Governor,
    GovernorSettings,
    GovernorCountingSimple,
    GovernorVotes,
    GovernorVotesQuorumFraction,
    GovernorTimelockControl
{
    constructor(
        IVotes _token,
        TimelockController _timelock
    )
        Governor("XUL Governor")
        GovernorSettings(
            1,      // 投票延迟: 1 区块
            50400,  // 投票期: 1 周
            100e18  // 提案阈值: 100 XUL
        )
        GovernorVotes(_token)
        GovernorVotesQuorumFraction(4)  // 法定人数: 4%
        GovernorTimelockControl(_timelock)
    {}
    
    // 必需的函数重写
    function votingDelay()
        public
        view
        override(Governor, GovernorSettings)
        returns (uint256)
    {
        return super.votingDelay();
    }
    
    function votingPeriod()
        public
        view
        override(Governor, GovernorSettings)
        returns (uint256)
    {
        return super.votingPeriod();
    }
    
    function quorum(uint256 blockNumber)
        public
        view
        override(Governor, GovernorVotesQuorumFraction)
        returns (uint256)
    {
        return super.quorum(blockNumber);
    }
    
    function state(uint256 proposalId)
        public
        view
        override(Governor, GovernorTimelockControl)
        returns (ProposalState)
    {
        return super.state(proposalId);
    }
    
    function proposalNeedsQueuing(uint256 proposalId)
        public
        view
        override(Governor, GovernorTimelockControl)
        returns (bool)
    {
        return super.proposalNeedsQueuing(proposalId);
    }
    
    function proposalThreshold()
        public
        view
        override(Governor, GovernorSettings)
        returns (uint256)
    {
        return super.proposalThreshold();
    }
    
    function _execute(
        uint256[] memory proposalId,
        bytes[] memory calldatas,
        bytes32 descriptionHash,
        address executor
    ) internal override(Governor, GovernorTimelockControl) {
        super._execute(proposalId, calldatas, descriptionHash, executor);
    }
    
    function _cancel(
        uint256[] memory proposalId,
        bytes[] memory calldatas,
        bytes32 descriptionHash,
        address executor
    ) internal override(Governor, GovernorTimelockControl) returns (uint48) {
        return super._cancel(proposalId, calldatas, descriptionHash, executor);
    }
    
    function _executor()
        internal
        view
        override(Governor, GovernorTimelockControl)
        returns (address)
    {
        return super._executor();
    }
    
    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(Governor, GovernorTimelockControl)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
```

---

### 3. Oracle 合约 (参考 Chainlink)

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title XULOracle
 * @notice 价格预言机，聚合多个数据源
 */
contract XULOracle is Ownable {
    
    struct PriceData {
        uint256 price;
        uint256 timestamp;
        uint256 confidence;
    }
    
    mapping(bytes32 => PriceData) public prices;
    mapping(address => bool) public authorizedFeeds;
    
    uint256 public constant PRICE_PRECISION = 1e8;
    uint256 public maxPriceAge = 1 hours;
    
    event PriceUpdated(bytes32 indexed pair, uint256 price, uint256 timestamp);
    event FeedAuthorized(address indexed feed);
    event FeedDeauthorized(address indexed feed);
    
    /**
     * @notice 授权数据源
     */
    function authorizeFeed(address feed) external onlyOwner {
        authorizedFeeds[feed] = true;
        emit FeedAuthorized(feed);
    }
    
    /**
     * @notice 取消授权数据源
     */
    function deauthorizeFeed(address feed) external onlyOwner {
        authorizedFeeds[feed] = false;
        emit FeedDeauthorized(feed);
    }
    
    /**
     * @notice 更新价格
     */
    function updatePrice(
        bytes32 pair,
        uint256 price,
        uint256 confidence
    ) external {
        require(authorizedFeeds[msg.sender], "Unauthorized feed");
        require(price > 0, "Invalid price");
        require(confidence <= 10000, "Invalid confidence");
        
        prices[pair] = PriceData({
            price: price,
            timestamp: block.timestamp,
            confidence: confidence
        });
        
        emit PriceUpdated(pair, price, block.timestamp);
    }
    
    /**
     * @notice 获取价格
     */
    function getPrice(bytes32 pair) external view returns (uint256) {
        PriceData memory data = prices[pair];
        require(data.price > 0, "Price not available");
        require(
            block.timestamp - data.timestamp <= maxPriceAge,
            "Price too old"
        );
        return data.price;
    }
    
    /**
     * @notice 获取价格和置信度
     */
    function getPriceWithConfidence(bytes32 pair)
        external
        view
        returns (uint256 price, uint256 confidence)
    {
        PriceData memory data = prices[pair];
        require(data.price > 0, "Price not available");
        require(
            block.timestamp - data.timestamp <= maxPriceAge,
            "Price too old"
        );
        return (data.price, data.confidence);
    }
}
```

---

## 📚 学习资源

### 官方文档
- [OpenZeppelin Contracts](https://docs.openzeppelin.com/contracts/)
- [Solidity 官方文档](https://docs.soliditylang.org/)
- [Hardhat 文档](https://hardhat.org/docs)

### 参考项目
- [Uniswap V4](https://github.com/Uniswap/v4-core)
- [Aave V3](https://github.com/aave/aave-v3-core)
- [Compound](https://github.com/compound-finance/compound-protocol)
- [Curve](https://github.com/curvefi/curve-contracts)

### 安全最佳实践
- [Solidity Security Considerations](https://docs.soliditylang.org/en/latest/security-considerations.html)
- [OpenZeppelin Security](https://docs.openzeppelin.com/contracts/4.x/security)
- [OWASP Smart Contract Top 10](https://owasp.org/www-project-smart-contract-top-10/)

---

## 🚀 部署检查清单

- [ ] 合约审计完成
- [ ] 测试覆盖率 > 90%
- [ ] Gas 优化完成
- [ ] 多签钱包部署
- [ ] 时间锁配置
- [ ] 应急暂停机制
- [ ] 事件日志完整
- [ ] 文档齐全
- [ ] 主网部署前测试网验证

---

**维护者**: XUL Chain 官方  
**最后更新**: 2026-03-30  
**状态**: 🟢 持续更新中
