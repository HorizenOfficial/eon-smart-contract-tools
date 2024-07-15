// Right-click on the script name and hit "Run" to execute
(async () => {
  try {
    console.log('Running forging stake script - delegate...');

    // Select one existing forger, or create your own and set the following values:

    // ##### ONLY SET THE FOLLOWING VALUES #####
    const AMOUNT = "0.00";              // Amount of ZEN of the new stake
    const YOUR_BLOCK_SIGN_PUBKEY = ""; // The public key that will sign the block when forged; populate this with the value of "Block Sign Public Key" from the forger you will delegate to.
    const YOUR_VRF_PUBKEY = "";        // The "VRF Public Key" of the forger you will delegate to.
    // ##### DO NOT MAKE ANY MORE CHANGES TO THE SCRIPT #####

    // This is the contract address for the Forger Stake Delegation contract. DO NOT CHANGE THIS VALUE.
    const contractAddress = "0x0000000000000000000022222222222222222333";
    const accounts = await web3.eth.getAccounts();
    const ownerAddress = accounts[0];
    const abi = require("./abi/forger_stake_v2.json");
    const contract = new web3.eth.Contract(abi, contractAddress, {from: ownerAddress});
    console.log('Account ' + ownerAddress);

    const value = web3.utils.toWei(AMOUNT.toString(), "ether");
    const nonce = await web3.eth.getTransactionCount(ownerAddress);

    let blockSignPublicKey = YOUR_BLOCK_SIGN_PUBKEY;
    if (!blockSignPublicKey.startsWith("0x")) {
      blockSignPublicKey = "0x" + blockSignPublicKey;
    }

    let forgerVrfPublicKey = YOUR_VRF_PUBKEY;
    if (!forgerVrfPublicKey.startsWith("0x")) {
      forgerVrfPublicKey = "0x" + forgerVrfPublicKey;
    }
    const first32BytesForgerVrfPublicKey = forgerVrfPublicKey.substring(0, 66);
    const lastByteForgerVrfPublicKey = "0x" + forgerVrfPublicKey.substring(66, 68);

    console.log("Sending delegate transaction...");
    await contract.methods.delegate(blockSignPublicKey,first32BytesForgerVrfPublicKey,lastByteForgerVrfPublicKey).send({value: value, nonce: nonce}).then(console.log);

    console.log("Transaction completed.");

  } catch (e) {
    console.log("Error:" + e.message);
  }
})()
