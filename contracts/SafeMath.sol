/**
 * Safe Math Smart Contract.  
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

/**
 * Provides methods to safely add, subtract and multiply uint256 numbers.
 */
contract SafeMath {
 
  /**
   * @dev Add two uint256 values, throw in case of overflow.
   *
   * @param a first value to add
   * @param b second value to add
   * @return x + y
   */
    function add(uint256 a, uint256 b) internal constant returns (uint256) {
        uint256 c = a + b;
        assert(c >= a);
        return c;
    }

  /**
   * @dev Subtract one uint256 value from another, throw in case of underflow.
   *
   * @param a value to subtract from
   * @param b value to subtract
   * @return a - b
   */
    function sub(uint256 a, uint256 b) internal constant returns (uint256) {
        assert(b <= a);
        return a - b;
    }


  /**
   * @dev Multiply two uint256 values, throw in case of overflow.
   *
   * @param a first value to multiply
   * @param b second value to multiply
   * @return c = a * b
   */
    function mul(uint256 a, uint256 b) internal constant returns (uint256) {
        uint256 c = a * b;
        assert(a == 0 || c / a == b);
        return c;
    }

 /**
   * @dev Divide two uint256 values, throw in case of overflow.
   *
   * @param a first value to divide
   * @param b second value to divide
   * @return c = a / b
   */
        function div(uint256 a, uint256 b) internal constant returns (uint256) {
        uint256 c = a / b;
        return c;
    }
}
