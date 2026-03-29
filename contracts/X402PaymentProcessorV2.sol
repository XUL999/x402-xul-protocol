// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

/**
 * @title X402PaymentProcessorV2
 * @notice Payment processor for X402 protocol on XUL Chain (升级版)
 * @dev 修复了以下安全问题:
 * - 签名重放攻击
 * - 缺少 EIP-712 域名分隔
 * - 缺少暂停功能
 */
contract X402PaymentProcessor is Ownable, ReentrancyGuard, Pausable {
    
    // Special address for native token (XUL)
    address public constant NATIVE_TOKEN = address(0);
    
    // EIP-712 Domain Separator (computed at runtime)
    bytes32 public DOMAIN_SEPARATOR;
    
    // Version for EIP-712
    bytes32 public constant NAME_HASH = keccak256("X402PaymentProcessor");
    bytes32 public constant VERSION_HASH = keccak256("2");
    bytes32 public constant TYPE_HASH = keccak256("EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)");
    
    struct PaymentAuthorization {
        address from;
        address to;
        uint256 value;
        uint48 validAfter;
        uint48 validBefore;
        bytes32 nonce;
        bytes32 domainSeparator;  // 新增：域分隔符验证
    }
    
    // Mapping of used nonces
    mapping(bytes32 => bool) public usedNonces;
    
    // Mapping of accepted tokens (ERC20 or native token)
    mapping(address => bool) public acceptedTokens;
    
    // Mapping of authorized facilitators
    mapping(address => bool) public authorizedFacilitators;
    
    // Maximum payment value to prevent large losses
    uint256 public maxPaymentValue = 1000000 ether;
    
    // Events
    event PaymentSettled(
        address indexed from,
        address indexed to,
        uint256 amount,
        bytes32 indexed nonce,
        address token
    );
    
    event TokenAdded(address indexed token);
    event TokenRemoved(address indexed token);
    event FacilitatorAuthorized(address indexed facilitator);
    event FacilitatorDeauthorized(address indexed facilitator);
    event MaxPaymentValueUpdated(uint256 newValue);
    event EmergencyWithdrawal(address indexed token, address indexed to, uint256 amount);
    
    constructor() Ownable() {
        DOMAIN_SEPARATOR = keccak256(
            abi.encode(
                TYPE_HASH,
                NAME_HASH,
                VERSION_HASH,
                block.chainid,
                address(this)
            )
        );
    }
    
    /**
     * @notice Settle a payment with ERC20 token or native token
     * @dev 修复: 在签名验证前检查 nonce，添加 domainSeparator 验证
     */
    function settlePayment(
        address token,
        PaymentAuthorization calldata auth,
        bytes calldata signature
    ) external payable nonReentrant whenNotPaused {
        // ✅ 修复1: 首先检查 nonce（在验证签名前）
        require(!usedNonces[auth.nonce], "Nonce already used");
        usedNonces[auth.nonce] = true;
        
        // ✅ 修复2: 验证 domainSeparator 防止跨域签名攻击
        require(auth.domainSeparator == DOMAIN_SEPARATOR, "Invalid domain separator");
        
        // ✅ 修复3: 验证时间窗口
        require(block.timestamp >= auth.validAfter, "Payment not yet valid");
        require(block.timestamp <= auth.validBefore, "Payment expired");
        
        // ✅ 修复4: 验证代币是否被接受
        require(acceptedTokens[token], "Token not accepted");
        
        // ✅ 修复5: 验证支付金额上限
        require(auth.value <= maxPaymentValue, "Value exceeds maximum");
        
        // 验证签名
        bytes32 messageHash = _createMessageHash(auth);
        address signer = _recoverSigner(messageHash, signature);
        require(signer == auth.from, "Invalid signature");
        
        // Transfer tokens
        if (token == NATIVE_TOKEN) {
            // Native token (XUL)
            require(msg.value >= auth.value, "Insufficient native token sent");
            (bool success, ) = payable(auth.to).call{value: auth.value}("");
            require(success, "Native token transfer failed");
            
            // Refund excess
            if (msg.value > auth.value) {
                (bool refund, ) = payable(msg.sender).call{value: msg.value - auth.value}("");
                require(refund, "Refund failed");
            }
        } else {
            // ERC20 token
            IERC20(token).transferFrom(auth.from, auth.to, auth.value);
        }
        
        emit PaymentSettled(auth.from, auth.to, auth.value, auth.nonce, token);
    }
    
    /**
     * @notice Check if a payment is valid (without settling)
     */
    function isPaymentValid(
        address token,
        PaymentAuthorization calldata auth,
        bytes calldata signature
    ) external view returns (bool, string memory) {
        if (!acceptedTokens[token]) return (false, "Token not accepted");
        if (usedNonces[auth.nonce]) return (false, "Nonce already used");
        if (block.timestamp < auth.validAfter) return (false, "Payment not yet valid");
        if (block.timestamp > auth.validBefore) return (false, "Payment expired");
        
        bytes32 messageHash = _createMessageHash(auth);
        address signer = _recoverSigner(messageHash, signature);
        if (signer != auth.from) return (false, "Invalid signature");
        
        return (true, "Valid");
    }
    
    /**
     * @notice Add accepted token (use address(0) for native token)
     */
    function addAcceptedToken(address token) external onlyOwner whenNotPaused {
        acceptedTokens[token] = true;
        emit TokenAdded(token);
    }
    
    /**
     * @notice Remove accepted token
     */
    function removeAcceptedToken(address token) external onlyOwner {
        acceptedTokens[token] = false;
        emit TokenRemoved(token);
    }
    
    /**
     * @notice Authorize facilitator
     */
    function authorizeFacilitator(address facilitator) external onlyOwner {
        authorizedFacilitators[facilitator] = true;
        emit FacilitatorAuthorized(facilitator);
    }
    
    /**
     * @notice Deauthorize facilitator
     */
    function deauthorizeFacilitator(address facilitator) external onlyOwner {
        authorizedFacilitators[facilitator] = false;
        emit FacilitatorDeauthorized(facilitator);
    }
    
    /**
     * @notice Update maximum payment value
     */
    function updateMaxPaymentValue(uint256 newValue) external onlyOwner {
        maxPaymentValue = newValue;
        emit MaxPaymentValueUpdated(newValue);
    }
    
    /**
     * @notice Pause the contract (emergency)
     */
    function pause() external onlyOwner {
        _pause();
    }
    
    /**
     * @notice Unpause the contract
     */
    function unpause() external onlyOwner {
        _unpause();
    }
    
    /**
     * @notice Create message hash for signature verification
     */
    function _createMessageHash(
        PaymentAuthorization calldata auth
    ) internal pure returns (bytes32) {
        return keccak256(
            abi.encode(
                auth.from,
                auth.to,
                auth.value,
                auth.validAfter,
                auth.validBefore,
                auth.nonce,
                auth.domainSeparator
            )
        );
    }
    
    /**
     * @notice Recover signer from signature
     */
    function _recoverSigner(
        bytes32 messageHash,
        bytes calldata signature
    ) internal pure returns (address) {
        bytes32 ethSignedMessageHash = keccak256(
            abi.encodePacked("\x19Ethereum Signed Message:\n32", messageHash)
        );
        return ECDSA.recover(ethSignedMessageHash, signature);
    }
    
    /**
     * @notice Allow contract to receive native tokens
     */
    receive() external payable {}
}

/**
 * @title ECDSA Signature Library
 */
library ECDSA {
    function recover(bytes32 hash, bytes calldata signature) internal pure returns (address) {
        require(signature.length == 65, "Invalid signature length");
        bytes32 r;
        bytes32 s;
        uint8 v;
        assembly {
            r := calldataload(signature.offset)
            s := calldataload(add(signature.offset, 32))
            v := byte(0, calldataload(add(signature.offset, 64)))
        }
        return ecrecover(hash, v, r, s);
    }
}
