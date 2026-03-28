// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title WETH - Wrapped ETH on XUL Chain
 * @notice ERC20 token representing ETH bridged from Ethereum
 */
contract WETH is ERC20, Ownable {
    uint8 private constant _decimals = 18;
    
    mapping(address => bool) public bridges;
    
    event BridgeAdded(address indexed bridge);
    event BridgeRemoved(address indexed bridge);
    event Mint(address indexed to, uint256 amount);
    event Burn(address indexed from, uint256 amount);
    
    constructor() 
        ERC20("Wrapped ETH", "WETH") 
        Ownable()
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

