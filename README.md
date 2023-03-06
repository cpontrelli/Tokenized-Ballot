This project demonstrates the capabilities of ERC20Votes to create a Tokenized Ballot smart contract.

Try running some of the following tasks:

```shell
yarn hardhat 
yarn hardhat compile
yarn hardhat test

deploy token contract:
yarn run ts-node --files ./scripts/MyToken.ts

delegate votes:
yarn run ts-node --files ./scripts/Delegate.ts "token_contract_address" "delegate_address"

deploy ballot contract
yarn run ts-node --files ./scripts/DeployTBallot.ts

check voting power on the ballot contract
yarn run ts-node --files ./scripts/CheckVotingPower.ts

```
