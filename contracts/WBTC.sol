// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title WBTC - Wrapped BTC on XUL Chain
 * @notice ERC20 token representing BTC bridged from Bitcoin network
 */
contract WBTC is ERC20, Ownable {
    uint8 private constant _decimals = 8;
    
    mapping(address => bool) public bridges;
    
    event BridgeAdded(address indexed bridge);
    event BridgeRemoved(address indexed bridge);
    event Mint(address indexed to, uint256 amount);
    event Burn(address indexed from, uint256 amount);
    
    constructor(address initialOwner) 
        ERC20("Wrapped BTC", "WBTC") 
        Ownable(initialOwner)
    {}
    
    function decimals() public pure override returns (uint8) {
        return _decimals;
    }
    
    function addBridge(address bridge) external onlyOwner {
        bridges[bridge] = true;
        emit BridgeAdded(bridge);
    }
    
    function removeBridge(address bridge) external onlyOwner {
        bridges[bridge] = false;
        emit BridgeRemoved(bridge);
    }
    
    function mint(address to, uint256 amount) external {
        require(bridges[msg.sender], "Only bridge can mint");
        _mint(to, amount);
        emit Mint(to, amount);
    }
    
    function burn(address from, uint256 amount) external {
        require(bridges[msg.sender], "Only bridge can burn");
        _burn(from, amount);
        emit Burn(from, amount);
    }
}
