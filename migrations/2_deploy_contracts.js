var ERC20Interface = artifacts.require("./ERC20Interface.sol");
var Owned = artifacts.require("./Owned.sol");
var SafeMath = artifacts.require("./SafeMath.sol");
var HVNToken = artifacts.require("./HVNToken");
var tokenRecipient = artifacts.require("./tokenRecipient.sol");
var StandardToken = artifacts.require("./StandardToken.sol");


module.exports = function(deployer) {
 
  deployer.deploy(HVNToken);
};
