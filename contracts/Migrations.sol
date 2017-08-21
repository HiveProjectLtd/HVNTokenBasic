/*
 * Migrations
 * 
 * Copyright © 2017 by Hive Project Ltd.
 *
 * Based on Smart Contract Token System by Monerium
 * https://github.com/monerium/smart-contracts
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * You may not use this file except in compliance with the License.
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND (express or implied).
 */

pragma solidity ^0.4.11;

contract Migrations {
    address public owner;
    uint public last_completed_migration;

    modifier restricted() {
        if (msg.sender == owner) _;
    }

    function Migrations() {
        owner = msg.sender;
    }

    function setCompleted(uint completed) restricted {
        last_completed_migration = completed;
    }

    function upgrade(address new_address) restricted {
        Migrations upgraded = Migrations(new_address);
        upgraded.setCompleted(last_completed_migration);
    }
}
