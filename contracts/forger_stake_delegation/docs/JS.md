# JS

In order to use the scripts in the [js](../js) folder, you will need to have Node.js installed on your machine.
The scripts are designed to be run using Node.js and will interact with the smart contract using the Web3.js library.
You will need to export your private key from your wallet and set it as an environment variable.

**BE CAREFUL WITH YOUR PRIVATE KEY, DO NOT SHARE IT WITH ANYONE, AND BE CAREFUL WHERE YOU STORE IT.**

## Environment Variables

In order to use the [index.js](../js/src/index.js) script you will need to set the following environment variables: 

### General
- `NETWORK` - **REQUIRED**. The network to connect to. Can be `eon` or `gobi`

### Transaction
- `FROM_ADDRESS` - **REQUIRED**. The address that will send the transaction
- `PRIVATE_KEY` - **REQUIRED**. The private key of the address that will send the transaction. Required to sign the transaction.
- `MAX_PRIORITY_FEE_PER_GAS` - **REQUIRED**. The maximum priority fee per gas for the transaction.
- `MAX_FEE_PER_GAS` - **REQUIRED**. The maximum fee per gas for the transaction.
- `GAS_LIMIT` - **REQUIRED**. The gas limit for the transaction. This value is used for withdraw operation. See notes below.

### Delegate script
In order to run the delegate operation you will need to set the following environment variables:
- `AMOUNT_TO_SEND` - **REQUIRED**. The amount of ZEN of the new stake
- `BLOCK_SIGN_PUBLIC_KEY` - **REQUIRED**. The public key that will sign the block when forged; populate this with the value of "Block Sign Public Key" from the forger you will delegate to.
- `FORGER_VRF_PUBLIC_KEY` - **REQUIRED**. The "VRF Public Key" from the forger you will delegate to.

### Withdraw script
In order to run the withdraw operation you will need to set the following environment variables:
- `STAKE_ID` - **REQUIRED**. The stakeId to withdraw
- `OWNER_ADDRESS` -  **OPTIONAL**. If not set, it will be the same as FROM_ADDRESS.
- `OWNER_PRIVATE_KEY` - **OPTIONAL**. If not set, it will be the same as PRIVATE_KEY. If OWNER_SIGNED_MESSAGE is set, it will be ignored.
- `OWNER_SIGNED_MESSAGE` - **OPTIONAL**. If the owner has already signed the message, paste the signature here, it will be used instead of signing the message with OWNER_PRIVATE_KEY. If not, leave it empty and the script will sign the message.

### StakeOf script
In order to run the stakeOf operation you will need to set the following environment variables:
- `STAKE_OF_OWNER_ADDRESS` - **REQUIRED**. Address to get stake from.

### getPagedForgersStakes script
In order to run the getPagedForgersStakes operation you will need to set the following environment variables:
- `PFS_START_INDEX` - **OPTIONAL**. Index to start from. Default is 0.
- `PFS_PAGE_SIZE` - **OPTIONAL**. Page size to return. Default is 10.

### getPagedForgersStakesByUser script
In order to run the getPagedForgersStakesByUser operation you will need to set the following environment variables:
- `PFSBU_OWNER_ADDRESS` - **REQUIRED**. Address to get stakes from.
- `PFSBU_START_INDEX` - **OPTIONAL**. Index to start from. Default is 0.
- `PFSBU_PAGE_SIZE` - **OPTIONAL**. Page size to return. Default is 10.

## Usage

Follow these steps in order to use the scripts in the [js](../js) folder:
1. Clone this repository
2. ```shell
    cd contracts/forger_stake_delegation/js
    npm install
    cp .env.template .env
    ```
3. Set the required environment variables for the operation you want to perform (see above).
4. ```shell
    npm run start
    ```
5. Follow the instructions in the terminal.
