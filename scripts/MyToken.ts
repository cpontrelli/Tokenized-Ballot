import { ethers } from "ethers";
import { MyToken__factory } from "../typechain-types";
import * as dotenv from "dotenv";
dotenv.config();

const MINT_VALUE = ethers.utils.parseEther("100");

async function main() {
    const account1: string = "0xCb2ED59c9427a43f72e2D31e1a51b33209AaEc96"; // Ilya
    const account2: string = "0xBA549d2730210AD373f9A29Ae918D3Bc7550C480"; // Charley
    const account3: string = "0xbc963FeB33f89e0085e039D6ba87a8b76EC3c92C"; // Keshav
    const account4: string = "0x6EB39A5c34C27B109A4Fc6F72CA2E7a380749D29"; // Seliana
    const account5: string = "0x1f82BC492eaf40eB1DC683977ae87366201ab42a"; // Harshit
   
     // setup for wallet access
    const privateKey = process.env.PRIVATE_KEY;
    if (!privateKey || privateKey.length <= 0) {
        throw new Error("No private key found");
    }

    // setup for provider access
    const alchemyApiKey = process.env.ALCHEMY_API_KEY;
    if (!alchemyApiKey || alchemyApiKey.length <= 0) {
        throw new Error("No Alchemy API key found");
    }

    const provider = new ethers.providers.AlchemyProvider("goerli", alchemyApiKey);
    const wallet = new ethers.Wallet(privateKey, provider);
    const deployer = wallet.connect(provider);
    const balance = await deployer.getBalance();
    console.log(`The account ${deployer.address} has a balance of ${balance} wei`);

    // contract ERC20 tokens deployment 
    const contractFactory = new MyToken__factory(deployer);
    const contract = await contractFactory.deploy();
    await contract.deployed();
    const contractAddress = contract.address; 
    const blockNumber = await provider.getBlockNumber() ;
    console.log(`The ERC20 tokencontract was deployed at address ${contractAddress} on the block number ${blockNumber}`)

    // token minting
    const mintTx = await contract.mint(deployer.address, MINT_VALUE);
    await mintTx.wait();
    
    const deployerBalance = await contract.balanceOf(deployer.address);
    console.log(`deployer has ${ethers.utils.formatEther(deployerBalance)} tokens`);
    let deployerVotingPower = await contract.getVotes(deployer.address);
    console.log(`Deployer has initial Voting power of ${ethers.utils.formatEther(deployerVotingPower)} units`);

    // token equal distribution across accounts
    let transferTx = await contract.connect(deployer).transfer(account2, MINT_VALUE.div(5));
    await transferTx.wait();
    const account2Balance = await contract.balanceOf(account2);

    transferTx = await contract.connect(deployer).transfer(account3, MINT_VALUE.div(5));
    await transferTx.wait();
    const account3Balance = await contract.balanceOf(account3);

    const account4Balance = await contract.balanceOf(account4);
    transferTx = await contract.connect(deployer).transfer(account4, MINT_VALUE.div(5));
    await transferTx.wait();

    const account5Balance = await contract.balanceOf(account5);
    transferTx = await contract.connect(deployer).transfer(account5, MINT_VALUE.div(5));
    await transferTx.wait();
    
    // self delegation for deployer
    const delegateTx = await contract.connect(deployer).delegate(deployer.address);
    await delegateTx.wait();

    deployerVotingPower = await contract.getVotes(deployer.address);
    const account1VotingPower = await contract.getVotes(account1);

    console.log(`Deployer has updated Voting power of ${ethers.utils.formatEther(deployerVotingPower)} units \n
    account2 has ${ethers.utils.formatEther(account2Balance)} tokens \n
    account3 has ${ethers.utils.formatEther(account3Balance)} tokens \n
    account4 has ${ethers.utils.formatEther(account4Balance)} tokens \n
    account5 has ${ethers.utils.formatEther(account5Balance)} tokens \n`
    );
};

main().catch((error)=> {
    console.log(error);
    process.exitCode = 1;
});

