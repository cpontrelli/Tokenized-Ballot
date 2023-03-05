import { ethers } from "ethers";
import { MyToken__factory } from "../typechain-types";
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
    const tokenContractAddress = args[2];
    if(!tokenContractAddress || tokenContractAddress.length <= 0) 
        throw new Error("Missing argument: contract addresses");

    const delegate = args[3];
    if (!delegate || delegate.length <= 0) throw new Error("Missing argument: delegate");
    
    console.log(`Delegating votes for: ${delegate}`);
    const contract = new MyToken__factory(signer).attach(tokenContractAddress);
    console.log("Delegating votes...");
    const delegateTx = await contract.delegate(delegate);
    await delegateTx.wait();
    console.log(
        `${delegate} votes have been delegated.`
    );

};

main().catch((error)=> {
    console.log(error);
    process.exitCode = 1;
});