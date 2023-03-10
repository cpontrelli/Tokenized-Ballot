import { ethers } from "ethers";
import { MyToken__factory } from "../typechain-types";
import * as dotenv from "dotenv";
dotenv.config();

async function main() {
    const tokenContractAddress: string = "0xDC05b06677CdE4660f5D3fCfED7Ac5Ab09693e2D";
    const account2: string = "0x00CeCbD23Dc1bc47359f2d26d255bE29b51e2E19"; // Charley
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
    const signer = wallet.connect(provider);
    const balance = await signer.getBalance();
    console.log(`The account ${signer.address} has a balance of ${balance} wei`);

    const contract = new MyToken__factory(signer).attach(tokenContractAddress);
    
    const account2MinterTx = await contract.grantRole(ethers.utils.keccak256("MINTER_ROLE"), account2);
    await account2MinterTx.wait();
    console.log(`Granted minter role to ${account2}`);

    const account3MinterTx = await contract.grantRole(ethers.utils.keccak256("MINTER_ROLE"), account3);
    await account3MinterTx.wait();
    console.log(`Granted minter role to ${account3}`);

    const account4MinterTx = await contract.grantRole(ethers.utils.keccak256("MINTER_ROLE"), account4);
    await account4MinterTx.wait();
    console.log(`Granted minter role to ${account4}`);

    const account5MinterTx = await contract.grantRole(ethers.utils.keccak256("MINTER_ROLE"), account5);
    await account5MinterTx.wait();
    console.log(`Granted minter role to ${account5}`);
};

main().catch((error)=> {
    console.log(error);
    process.exitCode = 1;
});

