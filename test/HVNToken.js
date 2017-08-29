var HVNToken = artifacts.require("./HVNToken.sol");

var SampleRecipientSuccess = artifacts.require('./SampleRecipientSuccess.sol')
var SampleRecipientThrow = artifacts.require('./SampleRecipientThrow.sol')

var fs = require('fs');

const evmThrewError = (err) => {
  if (err.toString().includes('VM Exception')) {
    return true
  }
  return false
}

const oneToken = 100000000
const initialSupply = 500000000 * oneToken
const tenThousandsTokens = 10000 * oneToken
const thousandTokens = 1000 * oneToken
const hundredTokens = 100 * oneToken
const fiftyTokens = 50 * oneToken

console.log("-".repeat(40))
console.log("\n", "Current date is:", new Date().toLocaleString("en-US", {timeZone: "UTC"}))
console.log("-".repeat(40))

contract('HVNToken', (accounts) => {
  it("should have total supply of 500,000,000.00000000 tokens", () => {
    return HVNToken.deployed()
      .then((token) => token.totalSupply())
      .then((supply) => assert.equal(supply.valueOf(), initialSupply, "initial supply is not " + initialSupply))
  })


  describe("Simple transfers", () => {
    it("should transfer 1,000 tokens to account 2", () => {
      return HVNToken.deployed()
        .then((token) => {
          return token.transfer(accounts[1], thousandTokens, { from: accounts[0] })
            .then(() => token.balanceOf(accounts[1]))
            .then((balance) => assert.equal(balance.valueOf(), thousandTokens, "account balance is not " + thousandTokens))
        })
    })

    it("account 1 should have 1,000 less tokens", () => {
      return HVNToken.deployed()
        .then((token) => {
          return token.balanceOf(accounts[0])
            .then((balance) => assert.equal(balance.valueOf(), (initialSupply-thousandTokens), "account balance is not " + (initialSupply-thousandTokens)))
        })
    })

    it("should fail transfering 2,000 tokens from account 2 to account 4", () => {
      return HVNToken.deployed()
        .then((token) => {
          return token.transfer(accounts[3], thousandTokens, { from: accounts[2] })
            .then(() => token.balanceOf(accounts[3]))
            .catch((err) => assert(evmThrewError(err), err.message))
        })
    })

    it("should protect the contract from short address attacks", () => {
      let longAddress  = 0x1234567890123456789012345678901234567800
      let shortAddress = 0x12345678901234567890123456789012345678
      return HVNToken.deployed()
        .then(token => {
          return token.transfer(longAddress, oneToken, { from: accounts[0] })
            .then(() => token.transfer(shortAddress, oneToken, { from: accounts[0] }))
            .then(() => token.balanceOf(longAddress))
            .then(balance => assert.equal(balance.valueOf(), oneToken, "vulnerable to short address attack"))
        })

    })
  })


  describe("Approval/Allowance", () => {
    it("account 2 should approve account 3 spending 100 tokens", () => {
      return HVNToken.deployed()
        .then(token => {
          return token.approve(accounts[2], hundredTokens, { from: accounts[1] })
            .then(() => token.allowance(accounts[1], accounts[2]))
            .then(result => assert.strictEqual(result.toNumber(), hundredTokens))
        })
    })

    it("account 3 should spend 50 tokens from account 2 balance", () => {
      return HVNToken.deployed()
        .then(token => {
          return token.transferFrom(accounts[1], accounts[3], fiftyTokens, { from: accounts[2] })
            .then(() => token.balanceOf(accounts[3]))
            .then((balance) => assert.equal(balance.valueOf(), fiftyTokens, "account balance is not 50.00000000"))
        })
    })

    it("should fail when transferFrom account with no allowance", () => {
      return HVNToken.deployed()
        .then(token => {
          return token.transferFrom(accounts[0], accounts[5], fiftyTokens, { from: accounts[5] })
            .then(() => token.balanceOf(accounts[3]))
            .catch((err) => assert(evmThrewError(err), err.message))
        })
    })

    it("should approve 100 to SampleRecipient and then notify SampleRecipient", () => {
      return HVNToken.deployed()
        .then(token => {
          return SampleRecipientSuccess.new({from: accounts[0]})
            .then((sampleRecipient) => {
              return token.approveAndCall(sampleRecipient.address, hundredTokens, '0x42')
                .then(() =>  token.allowance(accounts[0], sampleRecipient.address))
                .then(allowance => assert.strictEqual(allowance.toNumber(), hundredTokens))
                .then(() =>  sampleRecipient.value())
                .then(value => assert.strictEqual(value.toNumber(), hundredTokens))
            })

        })
    })

    it("should approve 100 to SampleRecipient and then notify SampleRecipient which will fail", () => {
      return HVNToken.deployed()
        .then(token => {
          return SampleRecipientThrow.new({from: accounts[0]})
            .then((sampleRecipient) => {
              return token.approveAndCall(sampleRecipient.address, hundredTokens, '0x42')
            })
        })
        .catch((err) => assert(evmThrewError(err), err.message))
    })
  })


  describe("Freez/Unfreeze", () => {
      it("owner should be able to freeze transfers and they should fail", () => {
        let token = null
        return HVNToken.deployed()
          .then((t) => token = t)
          .then(() => token.freezeTransfers())
          .then(() => token.transfer(accounts[6], thousandTokens, { from: accounts[0] }))
          .catch((err) => assert(evmThrewError(err), err.message))
      })

      it("owner should be able to unfreeze transfers and they should succeed", () => {
        let token = null
        return HVNToken.deployed()
          .then((t) => token = t)
          .then(() => token.unfreezeTransfers())
          .then(() => token.transfer(accounts[6], thousandTokens, { from: accounts[0] }))
          .then(() => token.balanceOf(accounts[6]))
          .then((balance) => assert.equal(balance.valueOf(), thousandTokens, "account balance is 1000.00000000"))
      })

      it("not-owner should not be able to freeze", () => {
        let token = null
        return HVNToken.deployed()
          .then((t) => token = t)
          .then(() => token.freezeTransfers({ from: accounts[1] }))
          .catch((err) => assert(evmThrewError(err), err.message))
      })

      it("not-owner should not be able to unfreeze", () => {
        let token = null
        return HVNToken.deployed()
          .then((t) => token = t)
          .then(() => token.freezeTransfers())
          .then(() => token.unfreezeTransfers({ from: accounts[1] }))
          .catch((err) => assert(evmThrewError(err), err.message))
      })
  })
})
