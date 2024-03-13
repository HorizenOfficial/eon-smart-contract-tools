# Remix

In order to use the scripts in the [remix](../remix) folder, you will need to import them into the [Web Remix IDE](https://remix.ethereum.org/).
The scripts are designed to be run in the web version of the Remix IDE as they require interaction with a wallet (MetaMask)
to sign the transactions.
The MetaMask wallet needs to have [added _eon_ or _gobi_ networks](https://docs.horizen.io/horizen_eon/connect/connect_your_wallet/).

## Environment Variables

In each script there is a section at the top that can be edited in order to set the environment variables. Some scripts like the getAllForgerStakes do not need 
any environment variable to be set.

The following scripts have environment variables that can be set in order to run it:

### Delegate script
In the [delegate script](../remix/delegate.js), you will need to set the following environment variables:
- `AMOUNT` - **REQUIRED** The amount of ZEN of the new stake
- `YOUR_BLOCK_SIGN_PUBKEY` - **REQUIRED** The public key that will sign the block when forged; populate this with the value of "Block Sign Public Key" from the forger you will delegate to.
- `YOUR_VRF_PUBKEY` - **REQUIRED** The "VRF Public Key" from the forger you will delegate to.

### Withdraw script
In the [withdraw script](../remix/withdraw.js), you will need to set the following environment variables:
- `STAKE_ID` - **REQUIRED** The stakeId to withdraw
- `OWNER_ADDRESS` - **OPTIONAL** If owner is different from caller, specify it here. Consider that the owner has to create the signature for the message in order to allow the caller to send the transaction.
- `OWNER_SIGNED_MESSAGE` - **OPTIONAL** If the owner has already signed the message, paste the signature here. If not, leave it empty and the script will sign the message.

### StakeOf script
In the [stakeOf script](../remix/stakeOf.js) you will need to set the following environment variables:
- `OWNER_ADDRESS` - **OPTIONAL** Address to get stake from.

### getPagedForgersStakes script
In the [getPagedForgersStakes](../remix/getPagedForgersStakes.js) script you will need to set the following environment variables:
- `START_INDEX` - **REQUIRED** Index to start from. Default is 0.
- `PAGE_SIZE` - **REQUIRED** Page size to return. Default is 10.

### getPagedForgersStakesByUser script
In the [getPagedForgersStakesByUser](../remix/getPagedForgersStakesByUser.js) script you will need to set the following environment variables:
- `OWNER_ADDRESS` - **OPTIONAL** Address to get stakes from.
- `START_INDEX` - **REQUIRED** Index to start from. Default is 0.
- `PAGE_SIZE` - **REQUIRED** Page size to return. Default is 10.

## Usage

Follow these steps in order to use the scripts in the [remix](../remix) folder:

1. Clone this repository or download as a zip and extract.
2. Open the [Web Remix IDE](https://remix.ethereum.org/).
3. Create a new workspace.

   ![create_new_workspace](./images/create_new_workspace.png)

4. Import the scripts from the [remix](../remix) folder using the "upload folder" functionality.

   ![upload_folder](./images/upload_folder.png)

5. [Connect your Metamask wallet to EON or GOBI networks](https://docs.horizen.io/horizen_eon/connect/connect_your_wallet/) 
and select the network you want to interact with (eon or gobi) and the address you want to use.

6. Connect your MetaMask wallet to the [Web Remix IDE](https://remix.ethereum.org/). Select injected provider in Web Remix IDE

   ![connect_metamask](./images/connect_metamask.png)

7. Open the script you want to run, set up the required environment variables in the script if necessary (see above), and run the script.

