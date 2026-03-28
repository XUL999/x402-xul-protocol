// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title XULSmartWallet
 * @notice 简化版智能钱包
 */
contract XULSmartWallet is Ownable {
    event Executed(address to, uint256 value);

    constructor() Ownable() {}

    function execute(address dest, uint256 value, bytes calldata func) external {
        (bool success, ) = dest.call{value: value}(func);
        require(success, "Call failed");
        emit Executed(dest, value);
    }

    function executeBatch(
        address[] calldata dest,
        uint256[] calldata value,
        bytes[] calldata func
    ) external {
        for (uint256 i = 0; i < dest.length; i++) {
            (bool success, ) = dest[i].call{value: value[i]}(func[i]);
            require(success, "Call failed");
        }
    }

    receive() external payable {}
}

/**
 * @title XULAIAgentRegistry
 * @notice ERC-8004 AI 代理注册
 */
contract XULAIAgentRegistry is ERC721, ERC721URIStorage, Ownable {
    uint256 private _nextAgentId;

    struct AIAgent {
        string name;
        string modelType;
        uint256 reputation;
        bool isActive;
    }

    struct ActionRecord {
        string actionType;
        bytes32 zkProof;
        uint256 timestamp;
    }

    mapping(uint256 => AIAgent) public agents;
    mapping(uint256 => ActionRecord[]) public agentActions;

    event AgentCreated(uint256 indexed id, string name);
    event ActionRecorded(uint256 indexed agentId, bytes32 zkProof);

    constructor() ERC721("XUL AI Agent", "XULAI") Ownable() {}

    function createAgent(
        string calldata name,
        string calldata modelType,
        string calldata configHash
    ) external returns (uint256) {
        uint256 agentId = _nextAgentId++;
        _safeMint(msg.sender, agentId);
        _setTokenURI(agentId, configHash);

        agents[agentId] = AIAgent({
            name: name,
            modelType: modelType,
            reputation: 0,
            isActive: true
        });

        emit AgentCreated(agentId, name);
        return agentId;
    }

    function recordAction(
        uint256 agentId,
        string calldata actionType,
        bytes32 zkProof
    ) external returns (uint256) {
        require(ownerOf(agentId) == msg.sender, "Not owner");

        agentActions[agentId].push(ActionRecord({
            actionType: actionType,
            zkProof: zkProof,
            timestamp: block.timestamp
        }));

        if (zkProof != bytes32(0)) {
            agents[agentId].reputation += 10;
        }

        emit ActionRecorded(agentId, zkProof);
        return agentActions[agentId].length - 1;
    }

    function _burn(uint256 tokenId) internal override(ERC721, ERC721URIStorage) {
        super._burn(tokenId);
    }

    function tokenURI(uint256 tokenId) public view override(ERC721, ERC721URIStorage) returns (string memory) {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(bytes4 interfaceId) public view override(ERC721, ERC721URIStorage) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
}

/**
 * @title XULzkMLVerifier
 * @notice zkML 验证器
 */
contract XULzkMLVerifier is Ownable {
    uint256 private _nextRequestId;

    struct ProofRequest {
        string modelHash;
        bytes output;
        bytes proof;
        bool verified;
    }

    mapping(bytes32 => bool) public verificationKeys;
    mapping(uint256 => ProofRequest) public requests;
    mapping(address => bool) public verifiers;

    event ProofRequested(uint256 indexed id, string modelHash);
    event ProofSubmitted(uint256 indexed id, bool verified);

    constructor() Ownable() {}

    function registerModel(string calldata, bytes32 verificationKey) external onlyOwner {
        verificationKeys[verificationKey] = true;
    }

    function addVerifier(address verifier) external onlyOwner {
        verifiers[verifier] = true;
    }

    function requestVerification(string calldata modelHash, bytes calldata) external returns (uint256) {
        uint256 requestId = _nextRequestId++;
        requests[requestId] = ProofRequest({
            modelHash: modelHash,
            output: "",
            proof: "",
            verified: false
        });
        emit ProofRequested(requestId, modelHash);
        return requestId;
    }

    function submitProof(uint256 requestId, bytes calldata output, bytes calldata proof) external returns (bool) {
        require(verifiers[msg.sender], "Not authorized");
        requests[requestId].output = output;
        requests[requestId].proof = proof;
        requests[requestId].verified = proof.length >= 32;
        emit ProofSubmitted(requestId, requests[requestId].verified);
        return requests[requestId].verified;
    }
}

/**
 * @title XULDePIN
 * @notice DePIN + AI 分布式计算网络
 */
contract XULDePIN is Ownable {
    using SafeERC20 for IERC20;

    enum DeviceType { GPU, CPU, IoT, Storage, Edge }
    enum DeviceStatus { Offline, Online, Busy }
    enum TaskStatus { Pending, Assigned, Completed, Failed }

    struct Device {
        uint256 id;
        address owner;
        DeviceType deviceType;
        DeviceStatus status;
        uint256 computePower;
        uint256 reputation;
        uint256 totalEarnings;
    }

    struct AITask {
        uint256 id;
        address requester;
        uint256 reward;
        uint256 assignedDevice;
        TaskStatus status;
    }

    uint256 private _nextDeviceId;
    uint256 private _nextTaskId;
    mapping(uint256 => Device) public devices;
    mapping(address => uint256[]) public ownerDevices;
    mapping(uint256 => AITask) public tasks;
    IERC20 public immutable rewardToken;

    event DeviceRegistered(uint256 indexed id, DeviceType deviceType);
    event TaskCreated(uint256 indexed id, uint256 reward);
    event TaskCompleted(uint256 indexed taskId, uint256 indexed deviceId);

    constructor(address _rewardToken) Ownable() {
        rewardToken = IERC20(_rewardToken);
    }

    function registerDevice(DeviceType deviceType, uint256 computePower) external returns (uint256) {
        uint256 deviceId = _nextDeviceId++;
        devices[deviceId] = Device({
            id: deviceId,
            owner: msg.sender,
            deviceType: deviceType,
            status: DeviceStatus.Online,
            computePower: computePower,
            reputation: 100,
            totalEarnings: 0
        });
        ownerDevices[msg.sender].push(deviceId);
        emit DeviceRegistered(deviceId, deviceType);
        return deviceId;
    }

    function createTask(uint256 reward) external returns (uint256) {
        uint256 taskId = _nextTaskId++;
        tasks[taskId] = AITask({
            id: taskId,
            requester: msg.sender,
            reward: reward,
            assignedDevice: 0,
            status: TaskStatus.Pending
        });
        emit TaskCreated(taskId, reward);
        return taskId;
    }

    function assignTask(uint256 taskId, uint256 deviceId) external {
        require(tasks[taskId].status == TaskStatus.Pending, "Not pending");
        tasks[taskId].assignedDevice = deviceId;
        tasks[taskId].status = TaskStatus.Assigned;
        devices[deviceId].status = DeviceStatus.Busy;
    }

    function completeTask(uint256 taskId) external {
        AITask storage task = tasks[taskId];
        Device storage device = devices[task.assignedDevice];
        require(device.owner == msg.sender, "Not assigned");
        task.status = TaskStatus.Completed;
        device.status = DeviceStatus.Online;
        device.totalEarnings += task.reward;
        device.reputation += 10;
        emit TaskCompleted(taskId, task.assignedDevice);
    }

    function getDevicesByOwner(address owner) external view returns (Device[] memory) {
        uint256[] memory ids = ownerDevices[owner];
        Device[] memory result = new Device[](ids.length);
        for (uint256 i = 0; i < ids.length; i++) {
            result[i] = devices[ids[i]];
        }
        return result;
    }
}
