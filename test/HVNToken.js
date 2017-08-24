var HVNToken = artifacts.require("./HVNToken.sol");
var fs = require('fs');

const evmThrewError = (err) => {
  if (err.toString().includes('VM Exception')) {
    return true
  }
  return false
}

contract('HNVToken', (accounts) => {
  it("should have total supply of 500,000,000.00000000 tokens", () => {
    return HVNToken.deployed()
      .then((token) => token.totalSupply())
      .then((supply) => assert.equal(supply.valueOf(), 50000000000000000, "initial supply is not 500,000,000.00000000"))
  });


  describe("Simple transfers", () => {
    it("should transfer 1,000 tokens to account 2", () => {
      return HVNToken.deployed()
        .then((token) => {
          return token.transfer(accounts[1], 100000000000, { from: accounts[0] })
            .then(() => token.balanceOf(accounts[1]))
            .then((balance) => assert.equal(balance.valueOf(), 100000000000, "account balance is not 1,000.00000000"))
        })
    });

    it("account 1 should have 1,000 less tokens", () => {
      return HVNToken.deployed()
        .then((token) => {
          return token.balanceOf(accounts[0])
            .then((balance) => assert.equal(balance.valueOf(), 49999900000000000, "account balance is not 499,999,000.00000000"))
        })
    });

    it("should fail transfering 2,000 tokens from account 2 to account 4", () => {
      return HVNToken.deployed()
        .then((token) => {
          return token.transfer(accounts[3], 100000000000, { from: accounts[2] })
            .then(() => token.balanceOf(accounts[3]))
            .catch((err) => assert(evmThrewError(err), err.message))
        })
    });
  })


  describe("Approval/Allowance", () => {
    it("account 2 should approve account 3 spending 100 tokens", () => {
      return HVNToken.deployed()
        .then(token => {
          return token.approve(accounts[2], 10000000000, { from: accounts[1] })
            .then(() => token.allowance(accounts[1], accounts[2]))
            .then(result => assert.strictEqual(result.toNumber(), 10000000000))
        })
    })

    it("account 3 should spend 50 tokens from account 2 balance", () => {
      return HVNToken.deployed()
        .then(token => {
          return token.transferFrom(accounts[1], accounts[3], 5000000000, { from: accounts[2] })
            .then(() => token.balanceOf(accounts[3]))
            .then((balance) => assert.equal(balance.valueOf(), 5000000000, "account balance is not 50.00000000"))
        })
    })

    it("should fail when transferFrom account with no allowance", () => {
      return HVNToken.deployed()
        .then(token => {
          return token.transferFrom(accounts[0], accounts[5], 15000000000, { from: accounts[5] })
            .then(() => token.balanceOf(accounts[3]))
            .catch((err) => assert(evmThrewError(err), err.message))
        })
    })
  })


  describe("Freez/Unfreeze", () => {
      it("owner should be able to freeze transfers and they should fail", () => {
        let token = null;
        return HVNToken.deployed()
          .then((t) => token = t)
          .then(() => token.freezeTransfers())
          .then(() => token.transfer(accounts[6], 100000000000, { from: accounts[0] }))
          .catch((err) => assert(evmThrewError(err), err.message))
      })

      it("owner should be able to unfreeze transfers and they should succeed", () => {
        let token = null;
        return HVNToken.deployed()
          .then((t) => token = t)
          .then(() => token.unfreezeTransfers())
          .then(() => token.transfer(accounts[6], 100000000000, { from: accounts[0] }))
          .then(() => token.balanceOf(accounts[6]))
          .then((balance) => assert.equal(balance.valueOf(), 100000000000, "account balance is 1000.00000000"))
      })

      it("not-owner should not be able to freeze", () => {
        let token = null;
        return HVNToken.deployed()
          .then((t) => token = t)
          .then(() => token.freezeTransfers({ from: accounts[1] }))
          .catch((err) => assert(evmThrewError(err), err.message))
      })

      it("not-owner should not be able to unfreeze", () => {
        let token = null;
        return HVNToken.deployed()
          .then((t) => token = t)
          .then(() => token.freezeTransfers())
          .then(() => token.unfreezeTransfers({ from: accounts[1] }))
          .catch((err) => assert(evmThrewError(err), err.message))
      })
  })

  describe("Mint/Burn", () => {
    it("should mint 10,000 tokens", () => {
      return HVNToken.deployed()
        .then((token) => {
          return token.totalSupply()
            .then(supplyBefore => {
              return token.mint(1000000000000)
                .then(() => token.totalSupply())
                .then((supplyAfter) => assert.equal(supplyAfter.valueOf(), parseInt(supplyBefore.valueOf()) + 1000000000000, "did not mint 10,000 tokens"))
            })
        })
    });

    it("not-owner should not be able to mint", () => {
      let token = null;
      return HVNToken.deployed()
        .then((t) => token = t)
        .then(() => token.mint(10000000000000, { from: accounts[1] }))
        .catch((err) => assert(evmThrewError(err), err.message))
    })

    it("anyone should be able to burn their tokens", () => {
      let token = null;
      return HVNToken.deployed()
        .then((token) => {
          return token.totalSupply()
            .then(supplyBefore => {
              return token.burn(100000000,  { from: accounts[1] })
                .then(() => token.totalSupply())
                .then((supplyAfter) => assert.equal(supplyAfter.valueOf(), parseInt(supplyBefore.valueOf()) - 100000000, "did not burn 1 token"))
            })
        })
    })
  })
});
