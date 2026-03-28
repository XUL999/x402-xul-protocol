// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title XULTranslator
 * @notice AI驱动的去中心化翻译系统
 * @dev 支持多语言翻译、质量验证、翻译者激励
 */
contract XULTranslator is Ownable {
    using SafeERC20 for IERC20;

    // 支持的语言
    enum Language {
        ZH,     // 中文
        EN,     // 英文
        JA,     // 日文
        KO,     // 韩文
        FR,     // 法文
        DE,     // 德文
        ES,     // 西班牙文
        RU,     // 俄文
        AR,     // 阿拉伯文
        PT,     // 葡萄牙文
        IT,     // 意大利文
        VI,     // 越南文
        TH,     // 泰文
        ID,     // 印尼文
        MS      // 马来文
    }

    // 翻译请求
    struct TranslationRequest {
        uint256 id;
        address requester;
        string sourceText;        // IPFS CID
        Language sourceLang;
        Language targetLang;
        uint256 reward;
        uint256 deadline;
        TranslationStatus status;
        string translation;       // IPFS CID
        address translator;
        uint256 qualityScore;      // 0-100
        bytes32 aiProof;          // AI翻译证明
    }

    // 翻译者信息
    struct Translator {
        address wallet;
        uint256 reputation;
        uint256 completedJobs;
        uint256 totalEarned;
        Language[] specialties;
        bool isVerified;
        bool isActive;
    }

    // AI模型信息
    struct AIModel {
        string name;
        string version;
        uint256 accuracy;
        bool isActive;
    }

    enum TranslationStatus {
        Pending,
        InProgress,
        Completed,
        Verified,
        Disputed,
        Cancelled
    }

    // 存储
    uint256 private _nextRequestId;
    mapping(uint256 => TranslationRequest) public requests;
    mapping(address => Translator) public translators;
    mapping(address => bool) public aiVerifiers;
    
    IERC20 public immutable rewardToken;
    AIModel[] public aiModels;
    uint256 public minReward;
    uint256 public platformFee;    // 百分比，如 5 = 5%
    uint256 public totalVolume;

    // 事件
    event TranslationRequested(uint256 indexed id, address indexed requester, Language sourceLang, Language targetLang);
    event TranslationSubmitted(uint256 indexed id, address indexed translator);
    event TranslationVerified(uint256 indexed id, uint256 qualityScore);
    event TranslatorRegistered(address indexed translator);
    event RewardDistributed(uint256 indexed requestId, uint256 amount);

    constructor(address _rewardToken) Ownable() {
        rewardToken = IERC20(_rewardToken);
        minReward = 1 ether;
        platformFee = 5; // 5%
        
        // 初始化AI模型
        aiModels.push(AIModel("GPT-4", "v4", 95, true));
        aiModels.push(AIModel("Claude", "v3", 94, true));
        aiModels.push(AIModel("DeepL", "v1", 92, true));
    }

    // ===== 核心功能 =====

    /**
     * @notice 请求翻译
     */
    function requestTranslation(
        string calldata sourceText,
        Language sourceLang,
        Language targetLang,
        uint256 reward,
        uint256 deadline
    ) external returns (uint256) {
        require(reward >= minReward, "Reward too low");
        require(deadline > block.timestamp, "Invalid deadline");
        
        // 转入奖励
        rewardToken.safeTransferFrom(msg.sender, address(this), reward);

        uint256 requestId = _nextRequestId++;
        requests[requestId] = TranslationRequest({
            id: requestId,
            requester: msg.sender,
            sourceText: sourceText,
            sourceLang: sourceLang,
            targetLang: targetLang,
            reward: reward,
            deadline: deadline,
            status: TranslationStatus.Pending,
            translation: "",
            translator: address(0),
            qualityScore: 0,
            aiProof: bytes32(0)
        });

        totalVolume += reward;
        emit TranslationRequested(requestId, msg.sender, sourceLang, targetLang);
        return requestId;
    }

    /**
     * @notice AI自动翻译
     */
    function aiTranslate(
        uint256 requestId,
        string calldata translation,
        bytes32 aiProof,
        uint256 qualityScore
    ) external {
        require(aiVerifiers[msg.sender], "Not AI verifier");
        require(requests[requestId].status == TranslationStatus.Pending, "Not pending");

        TranslationRequest storage request = requests[requestId];
        request.translation = translation;
        request.aiProof = aiProof;
        request.qualityScore = qualityScore;
        request.status = TranslationStatus.Completed;
        
        // AI翻译完成，退还90%奖励（10%作为平台费）
        uint256 refundAmount = (request.reward * 90) / 100;
        rewardToken.safeTransfer(request.requester, refundAmount);

        emit TranslationSubmitted(requestId, msg.sender);
    }

    /**
     * @notice 人工翻译者提交翻译
     */
    function submitTranslation(
        uint256 requestId,
        string calldata translation
    ) external {
        require(translators[msg.sender].isActive, "Not active translator");
        require(requests[requestId].status == TranslationStatus.Pending || 
                requests[requestId].status == TranslationStatus.InProgress, "Invalid status");

        TranslationRequest storage request = requests[requestId];
        request.translation = translation;
        request.translator = msg.sender;
        request.status = TranslationStatus.InProgress;

        emit TranslationSubmitted(requestId, msg.sender);
    }

    /**
     * @notice 验证翻译质量
     */
    function verifyTranslation(
        uint256 requestId,
        uint256 qualityScore,
        bytes32 aiProof
    ) external {
        require(aiVerifiers[msg.sender] || msg.sender == owner(), "Not verifier");
        require(requests[requestId].status == TranslationStatus.InProgress, "Not in progress");

        TranslationRequest storage request = requests[requestId];
        require(qualityScore <= 100, "Invalid score");
        
        request.qualityScore = qualityScore;
        request.aiProof = aiProof;
        request.status = TranslationStatus.Verified;

        // 分配奖励
        if (request.translator != address(0)) {
            uint256 platformAmount = (request.reward * platformFee) / 100;
            uint256 translatorAmount = request.reward - platformAmount;
            
            // 根据质量调整奖励
            if (qualityScore >= 90) {
                translatorAmount = (translatorAmount * 110) / 100; // 10% bonus
            } else if (qualityScore < 70) {
                translatorAmount = (translatorAmount * 80) / 100; // 20% penalty
            }

            translators[request.translator].totalEarned += translatorAmount;
            translators[request.translator].completedJobs++;
            translators[request.translator].reputation += qualityScore / 10;

            rewardToken.safeTransfer(request.translator, translatorAmount);
            emit RewardDistributed(requestId, translatorAmount);
        }

        emit TranslationVerified(requestId, qualityScore);
    }

    /**
     * @notice 注册为翻译者
     */
    function registerTranslator(Language[] calldata specialties) external {
        require(specialties.length > 0, "Need specialties");
        
        translators[msg.sender] = Translator({
            wallet: msg.sender,
            reputation: 50,
            completedJobs: 0,
            totalEarned: 0,
            specialties: specialties,
            isVerified: false,
            isActive: true
        });

        emit TranslatorRegistered(msg.sender);
    }

    /**
     * @notice 验证翻译者身份
     */
    function verifyTranslator(address translator, bool verified) external onlyOwner {
        translators[translator].isVerified = verified;
    }

    /**
     * @notice 争议处理
     */
    function disputeTranslation(uint256 requestId) external {
        require(msg.sender == requests[requestId].requester, "Not requester");
        require(requests[requestId].status == TranslationStatus.Completed, "Not completed");
        
        requests[requestId].status = TranslationStatus.Disputed;
    }

    /**
     * @notice 解决争议
     */
    function resolveDispute(
        uint256 requestId,
        bool favorTranslator,
        uint256 translatorShare
    ) external onlyOwner {
        TranslationRequest storage request = requests[requestId];
        require(request.status == TranslationStatus.Disputed, "Not disputed");

        if (favorTranslator && request.translator != address(0)) {
            uint256 amount = (request.reward * translatorShare) / 100;
            rewardToken.safeTransfer(request.translator, amount);
            uint256 remaining = request.reward - amount;
            if (remaining > 0) {
                rewardToken.safeTransfer(request.requester, remaining);
            }
        } else {
            rewardToken.safeTransfer(request.requester, request.reward);
        }

        request.status = TranslationStatus.Cancelled;
    }

    // ===== 查询功能 =====

    /**
     * @notice 获取翻译请求
     */
    function getRequest(uint256 requestId) external view returns (TranslationRequest memory) {
        return requests[requestId];
    }

    /**
     * @notice 获取翻译者信息
     */
    function getTranslator(address translator) external view returns (Translator memory) {
        return translators[translator];
    }

    /**
     * @notice 获取支持的AI模型
     */
    function getAIModels() external view returns (AIModel[] memory) {
        return aiModels;
    }

    /**
     * @notice 获取语言名称
     */
    function getLanguageName(Language lang) public pure returns (string memory) {
        if (lang == Language.ZH) return unicode"中文";
        if (lang == Language.EN) return "English";
        if (lang == Language.JA) return unicode"日本語";
        if (lang == Language.KO) return unicode"한국어";
        if (lang == Language.FR) return "Francais";
        if (lang == Language.DE) return "Deutsch";
        if (lang == Language.ES) return "Espanol";
        if (lang == Language.RU) return unicode"Русский";
        if (lang == Language.AR) return unicode"العربية";
        if (lang == Language.PT) return "Portugues";
        if (lang == Language.IT) return "Italiano";
        if (lang == Language.VI) return unicode"Tiếng Việt";
        if (lang == Language.TH) return unicode"ไทย";
        if (lang == Language.ID) return "Bahasa Indonesia";
        if (lang == Language.MS) return "Bahasa Melayu";
        return "Unknown";
    }

    // ===== 管理功能 =====

    function addAIVerifier(address verifier) external onlyOwner {
        aiVerifiers[verifier] = true;
    }

    function setMinReward(uint256 _minReward) external onlyOwner {
        minReward = _minReward;
    }

    function setPlatformFee(uint256 _fee) external onlyOwner {
        require(_fee <= 20, "Fee too high");
        platformFee = _fee;
    }

    function addAIModel(string calldata name, string calldata version, uint256 accuracy) external onlyOwner {
        aiModels.push(AIModel(name, version, accuracy, true));
    }
}
