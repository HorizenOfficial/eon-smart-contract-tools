// Right-click on the script name and hit "Run" to execute
(async () => {
  try {
    console.log('Running forging stake script - delegate...');

    // Select one existing forger, or create your own and set the following values:
    const AMOUNT = 0.00;              // Amount of ZEN of the new stake
    const YOUR_BLOCK_SIGN_PUBKEY = ""; // The public key that will sign the block when forged; populate this with the value of "Block Sign Public Key" from the forger you will delegate to.
    const YOUR_VRF_PUBKEY = "";        // The "VRF Public Key" of the forger you will delegate to.

    const address = "0x0000000000000000000022222222222222222222";
    const accounts = await web3.eth.getAccounts();
    const ownerAddress = accounts[0];
    const abi = require("./abi/forger_stake_delegation.json");
    const contract = new web3.eth.Contract(abi, address, {from: ownerAddress});
    console.log('Account ' + ownerAddress);

    const value = AMOUNT *10**18;
    const blockSignPublicKey = "0x" + YOUR_BLOCK_SIGN_PUBKEY;
    const forgerVrfPublicKey = "0x" + YOUR_VRF_PUBKEY;
    const first32BytesForgerVrfPublicKey = forgerVrfPublicKey.substring(0, 66);
    const lastByteForgerVrfPublicKey = "0x" + forgerVrfPublicKey.substring(66, 68);

    console.log("Sending delegate transaction...");
    await contract.methods.delegate(blockSignPublicKey,first32BytesForgerVrfPublicKey,lastByteForgerVrfPublicKey,ownerAddress).send({value: value}).then(console.log);

    console.log("Transaction completed.");

  } catch (e) {
    console.log("Error:" + e.message);
  }
})()
