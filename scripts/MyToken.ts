import { ethers } from "ethers";
import { MyToken__factory } from "../typechain-types";
import * as dotenv from "dotenv";
dotenv.config();

const MINT_VALUE = ethers.utils.parseEther("100");

async function main() {
    //const account1: string = "0x93eC5e12AC770eF01920dF0D870b5A075937b55b";
    //const account2: string = "0x6EB39A5c34C27B109A4Fc6F72CA2E7a380749D29";
   
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
    
    // self delegation
    const delegateTx = await contract.connect(deployer).delegate(deployer.address);
    await delegateTx.wait();

    deployerVotingPower = await contract.getVotes(deployer.address);
    console.log(`Deployer has updated Voting power of ${ethers.utils.formatEther(deployerVotingPower)} units`);


};

main().catch((error)=> {
    console.log(error);
    process.exitCode = 1;
});

