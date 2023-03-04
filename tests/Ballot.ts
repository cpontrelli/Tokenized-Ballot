import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { BigNumber } from "ethers";
import { ethers } from "hardhat";
import { Ballot, Ballot__factory, MyToken, MyToken__factory } from "../typechain-types";

const PROPOSALS = ['Proposal 1', 'Proposal 2', 'Proposal 3'];
const PROPOSAL_VOTED_ON = 1;
const MINT_VALUE = 10;

describe("Ballot", async () => {
    let tokenContract: MyToken;
        let deployer: SignerWithAddress;
        let account1: SignerWithAddress;
        let account2: SignerWithAddress;
        let ballotContract: Ballot;
        let blockTarget: number;
        let account1VotingPower: BigNumber;
        beforeEach(async () => {
            [deployer, account1, account2] = await ethers.getSigners();

            const tokenContractFactory = new MyToken__factory(deployer);
            tokenContract = await tokenContractFactory.deploy();
            await tokenContract.deployed();

            const mintTx = await tokenContract.mint(account1.address, MINT_VALUE);
            await mintTx.wait();

            const account1DelegateTx = await tokenContract.connect(account1).delegate(account1.address);
            await account1DelegateTx.wait();

            account1VotingPower = await tokenContract.getVotes(account1.address);

            blockTarget = await ethers.provider.getBlockNumber();

            const ballotContractFactory = new Ballot__factory(deployer);
            ballotContract = await ballotContractFactory.deploy(
                PROPOSALS.map((prop) => ethers.utils.formatBytes32String(prop)),
                tokenContract.address,
                blockTarget
            );
            await ballotContract.deployed();
        });

    describe("when the contract is deployed", async () => {
        
        it("has the provided proposals", async () => {
            for (let i = 0; i < PROPOSALS.length; i++) {
                const proposal = await ballotContract.proposals(i);
                expect(ethers.utils.parseBytes32String(proposal.name))
                    .to.eq(PROPOSALS[i]);
            };
        });

        it("has 0 votes for all proposals", async () => {
            for (let i = 0; i < PROPOSALS.length; i++) {
                const proposal = await ballotContract.proposals(i);
                expect(proposal.voteCount.toNumber()).to.eq(0);
            };
        });

        it("sets the right token contract address", async () => {
            const contract = await ballotContract.tokenContract();
            expect(contract).to.eq(tokenContract.address);
        });

        it("sets the right block number", async () => {
            const block = await ballotContract.blockTarget();
            expect(block.toNumber()).to.eq(blockTarget);
        });

        it("returns the right voting power", async () => {
            let votingPower = await ballotContract.votingPower(account1.address);
            expect(votingPower.toNumber()).to.eq(account1VotingPower.toNumber());
        });
    })

    describe("when votes are cast", async () => {
        beforeEach( async () => {
            const voteTx = await ballotContract.connect(account1).vote(PROPOSAL_VOTED_ON, MINT_VALUE);
            await voteTx.wait();
        });

        it("counts the votes", async () => {
            const votes = await ballotContract.proposals(PROPOSAL_VOTED_ON);
            expect(votes.voteCount.toNumber()).to.eq(MINT_VALUE);
        });

        it("should return voting power of zero for the voter", async () => {
            const votingPowerAfterVote = await ballotContract.votingPower(account1.address);
            expect(votingPowerAfterVote.toNumber()).to.eq(0);
        });

        it("should revert if voter tries to vote again", async () => {
            const voteTx = ballotContract.connect(account1).vote(PROPOSAL_VOTED_ON, MINT_VALUE);
            await expect(voteTx).to.be.revertedWith('Not enough voting power');
        });
    });
});