/**
 * ERC-20 Standard Token Smart Contract implementation.
 * 
 * Copyright © 2017 by Hive Project Ltd.
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * You may not use this file except in compliance with the License.
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND (express or implied).
 */

pragma solidity ^0.4.11;

import "./ERC20Interface.sol";
import "./Owned.sol";
import "./SafeMath.sol";
import "./TokenRecipient.sol";


/**
 * Standard Token Smart Contract that implements ERC-20 token interface
 */
contract HVNToken is ERC20Interface, SafeMath, Owned {

    mapping (address => uint256) balances;
    mapping (address => mapping (address => uint256)) allowed;
    string public constant name = "Hive Project Token";
    string public constant symbol = "HVN";
    uint8 public constant decimals = 8;
    string public version = '0.0.1';

    bool private transfersFrozen = false;

    /**
     * Protection against short address attack
     */
    modifier onlyPayloadSize(uint numwords) {
        assert(msg.data.length == numwords * 32 + 4);
        _;
    }

    /**
     * Check if transfers are on hold - frozen
     */
    modifier whenNotFrozen(){
        if (transfersFrozen) revert();
        _;
    }


    function HVNToken() ownerOnly {
        // send all tokens to the owner
        mint(50000000000000000);
    }


    /**
     * Freeze token transfers.
     */
    function freezeTransfers () ownerOnly {
        if (!transfersFrozen) {
            transfersFrozen = true;
            Freeze (msg.sender);
        }
    }


    /**
     * Unfreeze token transfers.
     */
    function unfreezeTransfers () ownerOnly {
        if (transfersFrozen) {
            transfersFrozen = false;
            Unfreeze (msg.sender);
        }
    }


    /**
     * Transfer sender's tokens to a given address
     */
    function transfer(address _to, uint256 _value) whenNotFrozen onlyPayloadSize(2) returns (bool success) {
        if(_to == 0x0) {
            return false;
        }
    
        balances[msg.sender] = sub(balances[msg.sender], _value);
        balances[_to] += _value;
        Transfer(msg.sender, _to, _value);
        return true;
    }


    /**
     * Transfer _from's tokens to _to's address
     */
    function transferFrom(address _from, address _to, uint256 _value) whenNotFrozen onlyPayloadSize(3) returns (bool success) {
        require(_to != 0x0);
        require(balances[_from] >= _value && allowed[_from][msg.sender] >= _value);

        balances[_from] = sub(balances[_from], _value);
        balances[_to] += _value;
        allowed[_from][msg.sender] = sub(allowed[_from][msg.sender], _value);
        Transfer(_from, _to, _value);
        return true;
    }


    /**
     * Returns number of tokens owned by given address.
     */
    function balanceOf(address _owner) constant returns (uint256 balance) {
        return balances[_owner];
    }


    /**
     * Sets approved amount of tokens for spender.
     */
    function approve(address _spender, uint256 _value) onlyPayloadSize(2) returns (bool success) {
        require(_value == 0 || allowed[msg.sender][_spender] == 0);
        allowed[msg.sender][_spender] = _value;
        Approval(msg.sender, _spender, _value);
        return true;
    }


    /**
     * Returns number of allowed tokens for given address.
     */
    function allowance(address _owner, address _spender) onlyPayloadSize(2) constant returns (uint256 remaining) {
        return allowed[_owner][_spender];
    }


    /**
     * Approve and then communicate the approved contract in a single transaction
     */
    function approveAndCall(address _spender, uint256 _value, bytes _extraData)  onlyPayloadSize(2) returns (bool success) {
        tokenRecipient spender = tokenRecipient(_spender);
        if (approve(_spender, _value)) {
            spender.receiveApproval(msg.sender, _value, this, _extraData);
            return true;
        }
    }


    /**
     * Minting functionality
     */
    function mint(uint256 _amount) ownerOnly {
        balances[owner] = add(balances[owner], _amount);
        totalSupply = add(totalSupply, _amount);

        Mint(owner, _amount);
    }


    /**
     * Burning functionality
     */
    function burn(uint256 _amount) returns (bool) {
        if (_amount > balances[msg.sender]) return false;

        balances[msg.sender] = sub(balances[msg.sender], _amount);
        totalSupply  = sub(totalSupply, _amount);
     
        Burn(msg.sender, _amount);
        return true;
    }


    /**
     * Peterson's Law Protection
     * Claim tokens
     */
    function claimTokens(address _token) ownerOnly {
        if (_token == 0x0) {
            owner.transfer(this.balance);
            return;
        }

        HVNToken token = HVNToken(_token);
        uint balance = token.balanceOf(this);
        token.transfer(owner, balance);
        logTokenTransfer(_token, owner, balance);
    }


    event Freeze (address indexed owner);
    event Unfreeze (address indexed owner);
    event logTokenTransfer(address token, address to, uint amount);
    event Mint(address indexed to, uint amount);
    event Burn(address indexed from, uint amount);
}
