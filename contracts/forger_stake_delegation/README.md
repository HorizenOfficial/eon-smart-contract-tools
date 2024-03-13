# FORGER STAKE DELEGATION

## Overview

Code to interact with the Eon sidechain forger stake delegation smart contract.

It provides two different ways to interact with the smart contract:
1. [remix](./docs/REMIX.md) - A set of scripts that can be imported into the Remix IDE to interact with the smart contract.
2. [js](./docs/JS.md) - A script that can be run using Node.js locally to interact with the smart contract.

## Notes

### Withdraw operation

Withdraw operation has two known issues:

- It requires to sign a message with the owner private key. This implies that, if using MetaMask to sign (remix), _eth_sign_ needs to be enabled in MetaMask.
- The message to sign requires to be hashed with `web3.utils.sha3()` algorithm, which is not the same algorithm used by `web3.eth.accounts.sign()`.
- The gas limit calculation fails, so a static value needs to be used. The script will use the value set in the .env file, but it may not be enough. If the transaction fails with an out of gas error, the script will print the gas used in the failed transaction. You can use that value to set the GAS_LIMIT in the .env file and try again.

