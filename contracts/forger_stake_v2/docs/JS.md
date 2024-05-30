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
- `MAX_PRIORITY_FEE_PER_GAS` - **REQUIRED**. The maximum priority fee per gas for the transaction.
- `MAX_FEE_PER_GAS` - **REQUIRED**. The maximum fee per gas for the transaction.
- `GAS_LIMIT` - **REQUIRED**. The gas limit for the transaction. This value is used for withdraw operation. See notes below.

### Delegate operation
In order to run the _delegate_ operation you will need to set the following environment variables:
- `DELEGATE_FROM_ADDRESS` - **REQUIRED**. The address that will send the transaction
- `DELEGATE_PRIVATE_KEY` - **REQUIRED**. The private key of the address that will send the transaction. Required to sign the transaction.
- `DELEGATE_AMOUNT` - **REQUIRED**. The amount of ZEN of the new stake
- `DELEGATE_BLOCK_SIGN_PUBLIC_KEY` - **REQUIRED**. The public key that will sign the block when forged; populate this with the value of "Block Sign Public Key" from the forger you will delegate to.
- `DELEGATE_VRF_PUBLIC_KEY` - **REQUIRED**. The "VRF Public Key" from the forger you will delegate to.

### Withdraw operation
In order to run the _withdraw_ operation you will need to set the following environment variables:
- `WITHDRAW_FROM_ADDRESS` - **REQUIRED**. The address that will send the transaction
- `WITHDRAW_PRIVATE_KEY` - **REQUIRED**. The private key of the address that will send the transaction. Required to sign the transaction.
- `WITHDRAW_AMOUNT` - **REQUIRED**. The amount of ZEN to withdraw from the stake
- `WITHDRAW_BLOCK_SIGN_PUBLIC_KEY` - **REQUIRED**. The public key that will sign the block when forged; populate this with the value of "Block Sign Public Key" from the forger you will withdraw from.
- `WITHDRAW_VRF_PUBLIC_KEY` - **REQUIRED**. The "VRF Public Key" from the forger you will withdraw from.

### StakeStart operation
In order to run the _stakeStart_ operation you will need to set the following environment variables:
- `STAKE_START_BLOCK_SIGN_PUBLIC_KEY` - **REQUIRED**. The "Block Sign Public Key" from the forger to get the stake from.
- `STAKE_START_VRF_PUBLIC_KEY` - **REQUIRED**. The "VRF Public Key" from the forger to get the stake from.
- `STAKE_START_DELEGATOR_ADDRESS` - **REQUIRED**. Address to get stake from.

### StakeTotal operation
In order to run the _stakeTotal_ operation you will need to set the following environment variables:
- `STAKE_TOTAL_BLOCK_SIGN_PUBLIC_KEY` - **OPTIONAL**. The "Block Sign Public Key" from the forger to get the stake from. Default is "0x0000000000000000000000000000000000000000000000000000000000000000".
- `STAKE_TOTAL_VRF_PUBLIC_KEY` - **OPTIONAL**. The "VRF Public Key" from the forger to get the stake from. Default is "0x000000000000000000000000000000000000000000000000000000000000000000"
- `STAKE_TOTAL_DELEGATOR_ADDRESS` - **OPTIONAL**. Address to get stake from. If this value is provided the **STAKE_TOTAL_BLOCK_SIGN_PUBLIC_KEY** and **STAKE_TOTAL_VRF_PUBLIC_KEY** must be provided as well. Default is "0x0000000000000000000000000000000000000000".
- `STAKE_TOTAL_CONSENSUS_EPOCH_START` - **OPTIONAL**. Initial consensus epoch to calculate the stake for. Default is 0.
- `STAKE_TOTAL_MAX_NUM_OF_EPOCH` - **OPTIONAL**. Number of epochs to calculate the stake for. Default is 0. If both this value and previous one are 0 the current consensus epoch data will be returned.

### RewardsReceived operation
In order to run the _rewardsReceived_ operation you will need to set the following environment variables:
- `REWARDS_RECEIVED_BLOCK_SIGN_PUBLIC_KEY` - **REQUIRED**. The "Block Sign Public Key" from the forger to get the rewards from.
- `REWARDS_RECEIVED_VRF_PUBLIC_KEY` - **REQUIRED**. The "VRF Public Key" from the forger to get the rewards from.
- `REWARDS_RECEIVED_CONSENSUS_EPOCH_START` - **REQUIRED**. Initial consensus epoch to calculate the rewards for. 
- `REWARDS_RECEIVED_MAX_NUM_OF_EPOCH` - **REQUIRED**. Number of epochs to calculate the rewards for.

### GetForger operation
In order to run the _getForger_ operation you will need to set the following environment variables:
- `GET_FORGER_BLOCK_SIGN_PUBLIC_KEY` - **REQUIRED**. The "Block Sign Public Key" from the forger to get the information from.
- `GET_FORGER_VRF_PUBLIC_KEY` - **REQUIRED**. The "VRF Public Key" from the forger to get the information from.

### GetPagedForgers operation
In order to run the _getPagedForgers_ operation you will need to set the following environment variables:
- `GPF_START_INDEX` - **OPTIONAL**. Index to start from. Default is 0.
- `GPF_PAGE_SIZE` - **OPTIONAL**. Page size to return. Default is 10.

### GetPagedForgersStakesByDelegator operation
In order to run the _getPagedForgersStakesByDelegator_ operation you will need to set the following environment variables:
- `GPFS_BY_DELEGATOR_ADDRESS` - **REQUIRED**. Address to get stakes from.
- `GPFS_BY_DELEGATOR_START_INDEX` - **OPTIONAL**. Index to start from. Default is 0.
- `GPFS_BY_DELEGATOR_PAGE_SIZE` - **OPTIONAL**. Page size to return. Default is 10.

### GetPagedForgersStakesByForger operation
In order to run the _getPagedForgersStakesByForger_ operation you will need to set the following environment variables:
- `GPFS_BY_FORGER_BLOCK_SIGN_PUBLIC_KEY` - **REQUIRED**. The "Block Sign Public Key" from the forger to get the stakes from.
- `GPFS_BY_FORGER_VRF_PUBLIC_KEY` - **REQUIRED**. The "VRF Public Key" from the forger to get the stakes from.
- `GPFS_BY_FORGER_START_INDEX` - **OPTIONAL**. Index to start from. Default is 0.
- `GPFS_BY_FORGER_PAGE_SIZE` - **OPTIONAL**. Page size to return. Default is 10.

## Usage

Follow these steps in order to use the scripts in the [js](../js) folder:
1. Clone this repository
2. ```shell
    cd contracts/forger_stake_v2/js
    npm install
    cp .env.template .env
    ```
3. Set the required environment variables for the operation you want to perform (see above).
4. ```shell
    npm run start
    ```
5. Follow the instructions in the terminal.
