import { ethers } from "ethers";
import * as dotenv from "dotenv";
import { Ballot__factory, MyToken__factory } from "../typechain-types";
dotenv.config();

const PROPOSALS = ["Proposal A", "Proposal B", "Proposal C"];
const tokenContractAddress: string = "0xDC05b06677CdE4660f5D3fCfED7Ac5Ab09693e2D";

function convertToBytes32(proposal: string[]): string[] {
    return proposal.map((p) => ethers.utils.formatBytes32String(p));
}

async function main() {

    // setup for contract 
    let proposals = process.argv.slice(2);
    if (proposals.length <= 0) {
        proposals = PROPOSALS;
    }
    console.log("Proposals: ");
    proposals.forEach((element, index) => {
        console.log(`Proposal N. ${index + 1}: ${element}`);
    });

     // setup for wallet access of deployer
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
    const signer = wallet.connect(provider);
    const balance = await signer.getBalance();
    console.log(`The account ${signer.address} has a balance of ${balance} wei`);

   
    // Ballot__factory is picked directly from typechain-types
    const ballotContractFactory = new Ballot__factory(signer);
    // check the constructor of the contract
    const convertedProposals = convertToBytes32(proposals);
    console.log("Deploying Ballot contract ...");
    // sending the transaction to the blockchain
    const blockTarget = await provider.getBlockNumber();
    const ballotContract = await ballotContractFactory.deploy(convertedProposals, 
        tokenContractAddress,
        blockTarget); 
    console.log("Awaiting Ballot contract to be deployed ...");
    // waiting for the transaction to be mined
    const transactionReceipt = await ballotContract.deployTransaction.wait();
    const contractAddress = transactionReceipt.contractAddress;
    const blockNumber = transactionReceipt.blockNumber;
    console.log(`Ballot contract deployed at ${contractAddress} and block number ${blockNumber}`);

}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});