// need have setup for goerly 
import { ethers } from "ethers";
import { MyToken__factory } from "../typechain-types";
import * as dotenv from "dotenv";
dotenv.config();

const MINT_VALUE = ethers.utils.parseEther("100");

async function main() {
    // maybe write down our wallet addresses directly as a const
    //const account1: string = "0x93eC5e12AC770eF01920dF0D870b5A075937b55b";
    //const account2: string = "0x6EB39A5c34C27B109A4Fc6F72CA2E7a380749D29";
    //const [deployer, account1, account2] = await ethers.getSigners();

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

    const contractFactory = new MyToken__factory(deployer);
    const contract = await contractFactory.deploy();
    const txReceipt = await contract.deployed();
    const contractAddress = contract.address; //Undefined
    const blockNumber = await provider.getBlockNumber() ; //Undefined
    console.log(`The ERC20 tokencontract was deployed at address ${contractAddress} on the block number ${blockNumber}`)

    const mintTx = await contract.mint(deployer.address, MINT_VALUE);
    await mintTx.wait();
    
    const account1Balance = await contract.balanceOf(deployer.address);
    console.log(`Account1 has ${ethers.utils.formatEther(account1Balance)} tokens`);
    let account1VotingPower = await contract.getVotes(deployer.address);
    console.log(`Account1 has initial Voting power of ${ethers.utils.formatEther(account1VotingPower)} units`);
    
    // self delegation
    const delegateTx = await contract.connect(deployer.address).delegate(deployer.address);
    await delegateTx.wait();

    account1VotingPower = await contract.getVotes(deployer.address);
    console.log(`Account1 has updated Voting power of ${ethers.utils.formatEther(account1VotingPower)} units`);


};

main().catch((error)=> {
    console.log(error);
    process.exitCode = 1;
});

