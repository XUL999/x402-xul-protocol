// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title X402PaymentProcessor
 * @notice Payment processor for X402 protocol on XUL Chain
 * @dev Handles payment verification and settlement for API monetization
 * Supports both ERC20 tokens and native XUL token (address(0))
 */
contract X402PaymentProcessor is Ownable, ReentrancyGuard {
    
    // Special address for native token (XUL)
    address public constant NATIVE_TOKEN = address(0);
    
    struct PaymentAuthorization {
        address from;
        address to;
        uint256 value;
        uint48 validAfter;
        uint48 validBefore;
        bytes32 nonce;
    }
    
    // Mapping of used nonces
    mapping(bytes32 => bool) public usedNonces;
    
    // Mapping of accepted tokens (ERC20 or native token)
    mapping(address => bool) public acceptedTokens;
    
    // Mapping of facilitator authorization
    mapping(address => bool) public authorizedFacilitators;
    
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
    
    constructor(address initialOwner) Ownable(initialOwner) {}
    
    /**
     * @notice Settle a payment with ERC20 token or native token
     */
    function settlePayment(
        address token,
        PaymentAuthorization calldata auth,
        bytes calldata signature
    ) external payable nonReentrant {
        require(acceptedTokens[token], "Token not accepted");
        require(!usedNonces[auth.nonce], "Nonce already used");
        require(block.timestamp >= auth.validAfter, "Payment not yet valid");
        require(block.timestamp <= auth.validBefore, "Payment expired");
        
        // Verify signature
        bytes32 messageHash = _createMessageHash(auth);
        address signer = _recoverSigner(messageHash, signature);
        require(signer == auth.from, "Invalid signature");
        
        // Mark nonce as used
        usedNonces[auth.nonce] = true;
        
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
    function addAcceptedToken(address token) external onlyOwner {
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
                auth.nonce
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

// ECDSA library import
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
