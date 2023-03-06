import { ethers } from "ethers";
import { Ballot__factory } from "../typechain-types";
import * as dotenv from "dotenv";
dotenv.config();

async function main() {
   
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
    const signer = wallet.connect(provider);
    const balance = await signer.getBalance();
    console.log(`The account ${signer.address} has a balance of ${balance} wei`);

    const args = process.argv;
    const ballotContractAddress = args[2];
    if(!ballotContractAddress || ballotContractAddress.length <= 0) 
        throw new Error("Missing argument: contract addresses");

    const voter = args[3];
    if (!voter || voter.length <= 0) throw new Error("Missing argument: voter address");
    
    console.log(`Checking voting power for: ${voter}`);
    const contract = new Ballot__factory(signer).attach(ballotContractAddress);
    const votingPower = await contract.votingPower(voter);
    console.log(
        `${voter} has ${votingPower} voting power.`
    );

};

main().catch((error)=> {
    console.log(error);
    process.exitCode = 1;
});