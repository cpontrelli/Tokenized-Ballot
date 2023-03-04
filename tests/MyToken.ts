import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { BigNumber } from "ethers";
import { ethers } from "hardhat";
import { MyToken, MyToken__factory } from "../typechain-types";

const MINT_VALUE = 10;

describe("MyToken", async () => {
    let tokenContract: MyToken;
    let deployer: SignerWithAddress;
    let account1: SignerWithAddress;
    let account2: SignerWithAddress;
    let balanceBeforeMint: BigNumber;
    beforeEach(async () => {
        [deployer, account1, account2] = await ethers.getSigners();

        const tokenContractFactory = new MyToken__factory(deployer);
        tokenContract = await tokenContractFactory.deploy();
        await tokenContract.deployed();

        balanceBeforeMint = await tokenContract.balanceOf(account1.address);
        const mintTx = await tokenContract.mint(account1.address, MINT_VALUE);
        await mintTx.wait();
    });

    describe("when tokens are minted", async () => {
        it("assigns the correct balance", async () => {
            const balanceAfterMint = await tokenContract.balanceOf(account1.address);
            expect(balanceAfterMint.toNumber()).to.eq(balanceBeforeMint.add(MINT_VALUE).toNumber());
            });
    
            it("should not assign voting power", async () => {
            const votingPower = await tokenContract.getVotes(account1.address);
            expect(votingPower.toNumber()).to.be.equal(0); 
            });
    });

    describe("when tokens are delegated", async () => {
        beforeEach( async () => {
            const account1DelegateTx = await tokenContract.connect(account1).delegate(account1.address);
            await account1DelegateTx.wait();
        });
        it("should assign voting power when delegated", async () => {
            const votingPower = await tokenContract.getVotes(account1.address);
            expect(votingPower.toNumber()).to.eq(MINT_VALUE);
        });

        it("should change voting power when tokens are transferred", async () => {
            const transferTx = await tokenContract.connect(account1).transfer(account2.address, MINT_VALUE / 2);
            await transferTx.wait();
            const account1VotingPower = await tokenContract.getVotes(account1.address);
            expect(account1VotingPower.toNumber()).to.eq(MINT_VALUE / 2);

            const account2DelegateTx = await tokenContract.connect(account1).delegate(account1.address);
            await account2DelegateTx.wait();
            const account2VotingPower = await tokenContract.getVotes(account1.address);
            expect(account2VotingPower.toNumber()).to.eq(MINT_VALUE / 2);
        });
    })
    
});
