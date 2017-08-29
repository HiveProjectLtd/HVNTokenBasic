/**
 * SampleRecipientSuccess Smart Contract.
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

contract SampleRecipientSuccess {
    /* A Generic receiving function for contracts that accept tokens */
    address public from;
    uint256 public value;
    address public tokenContract;
    bytes public extraData;

    event ReceivedApproval(uint256 _value);

    function receiveApproval(address _from, uint256 _value, address _tokenContract, bytes _extraData) {
        from = _from;
        value = _value;
        tokenContract = _tokenContract;
        extraData = _extraData;
        ReceivedApproval(_value);
    }
}