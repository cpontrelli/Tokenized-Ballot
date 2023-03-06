import { ethers } from "ethers";
import * as dotenv from "dotenv";
import { Ballot__factory, MyToken__factory } from "../typechain-types";
dotenv.config();

function convertToBytes32(proposal: string[]): string[] {
    return proposal.map((p) => ethers.utils.formatBytes32String(p));
}

async function main() {

// const ballotTokenAddress: string = "0xDC05b06677CdE4660f5D3fCfED7Ac5Ab09693e2D";
// const ballotContractAddress: string = "0xceF3DA0f3F6f202e263BE3F4C78aebC61AF1E699";

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
 const balanceInWei = await voter.getBalance();
 const balanceInEther = await ethers.utils.formatEther(balanceInWei);
 console.log(`The account ${voter.address} has a balance of ${balanceInEther} ETH`);

const args = process.argv;

// set the ballot contract address for participate on voting
const ballotContractAddress = args[2];
if(!ballotContractAddress || ballotContractAddress.length <= 0) 
    throw new Error("Missing argument: contract address");

const ballotContract = new Ballot__factory(voter).attach(ballotContractAddress);

// set arguments for voting: proposal number and voting pover to give on vote
const proposal = args[3];
const power = args[4];

// voting
const voteTx = await ballotContract.connect(voter).vote(proposal, power);
await voteTx.wait();
console.log(`You have voted on Proposal ${proposal} with power of ${power} tokens \n Your votes has been accepted`);

}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});