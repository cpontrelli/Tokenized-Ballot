import { ethers } from "ethers";
import * as dotenv from "dotenv";
import { Ballot__factory, MyToken__factory } from "../typechain-types";
dotenv.config();

async function main() {

const ballotContractAddress: string = "0xDC05b06677CdE4660f5D3fCfED7Ac5Ab09693e2D";

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
 const voter = wallet.connect(provider);
 const balance = await voter.getBalance();
 console.log(`The account ${voter.address} has a balance of ${balance} wei`);

// Ballot__factory is picked directly from typechain-types
const ballotContractFactory = new Ballot__factory(voter);

const args = process.argv;

const contractAddress = args[2];
if(!contractAddress || contractAddress.length <= 0) 
    throw new Error("Missing argument: contract addresses");

const vote = args[3];
    if (!vote || vote.length <= 0) throw new Error("Missing argument: vote");
    console.log(`Casting vote for proposal: ${vote}`);

const ballotContract = new Ballot__factory(voter).attach(contractAddress);

// voting
const voteTx = await ballotContract.connect(voter).vote("Proposal A", 1);
await voteTx.wait();
console.log(`Your vote on Ballot was accepted`);

}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});