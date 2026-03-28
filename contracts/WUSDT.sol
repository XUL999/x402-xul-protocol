// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title WUSDT - Wrapped USDT on XUL Chain
 * @notice ERC20 token representing USDT bridged from other chains
 * @dev This is a wrapped token for cross-chain bridge purposes
 */
contract WUSDT is ERC20, Ownable {
    uint8 private constant _decimals = 6;
    
    // Bridge address that can mint/burn tokens
    mapping(address => bool) public bridges;
    
    event BridgeAdded(address indexed bridge);
    event BridgeRemoved(address indexed bridge);
    event Mint(address indexed to, uint256 amount);
    event Burn(address indexed from, uint256 amount);
    
    constructor(address initialOwner) 
        ERC20("Wrapped USDT", "WUSDT") 
        Ownable(initialOwner)
    {}
    
    function decimals() public pure override returns (uint8) {
        return _decimals;
    }
    
    /**
     * @notice Add a bridge address that can mint/burn
     */
    function addBridge(address bridge) external onlyOwner {
        bridges[bridge] = true;
        emit BridgeAdded(bridge);
    }
    
    /**
     * @notice Remove a bridge address
     */
    function removeBridge(address bridge) external onlyOwner {
        bridges[bridge] = false;
        emit BridgeRemoved(bridge);
    }
    
    /**
     * @notice Mint tokens (only callable by bridges)
     */
    function mint(address to, uint256 amount) external {
        require(bridges[msg.sender], "Only bridge can mint");
        _mint(to, amount);
        emit Mint(to, amount);
    }
    
    /**
     * @notice Burn tokens (only callable by bridges)
     */
    function burn(address from, uint256 amount) external {
        require(bridges[msg.sender], "Only bridge can burn");
        _burn(from, amount);
        emit Burn(from, amount);
    }
}
