import { ethers } from "hardhat";
import { MyToken__factory } from "../typechain-types";

const MINT_VALUE = ethers.utils.parseEther("10");

async function main() {
    const [deployer, account1, account2] = await ethers.getSigners();
    const contractFactory = new MyToken__factory(deployer);
    const contract = await contractFactory.deploy();
    const txReceipt = await contract.deployed();

    const mintTx = await contract.mint(account1.address, MINT_VALUE);
    await mintTx.wait();
    
    const account1Balance = await contract.balanceOf(account1.address);
    console.log(account1Balance);
    let account1VotingPower = await contract.getVotes(account1.address);
    console.log(account1VotingPower);
    
    const delegateTx = await contract.connect(account1).delegate(account1.address);
    await delegateTx.wait();

    account1VotingPower = await contract.getVotes(account1.address);
    console.log(account1VotingPower);


};

main().catch((error)=> {
    console.log(error);
    process.exitCode = 1;
});

