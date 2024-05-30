// Right-click on the script name and hit "Run" to execute

/*
   Return total sum paid to the forger reward_address at the end of one or more consensus epochs.
   Returned array contains also elements with 0 value. Returned values are ordered by epoch, and the array length may
   be < maxNumOfEpoch if the current consensus epoch is < (consensusEpochStart + maxNumOfEpoch) or if the forger was
   registered after consensusEpochStart.
*/
(async () => {
  try {
    console.log('Running forging stake script - rewardsReceived...');

    // Select one existing forger, or create your own and set the following values:

    // ##### ONLY SET THE FOLLOWING VALUES #####
    const YOUR_BLOCK_SIGN_PUBKEY = ""; // The public key that will sign the block when forged; populate this with the value of "Block Sign Public Key" from the forger.
    const YOUR_VRF_PUBKEY = "";        // The "VRF Public Key" of the forger.
    const CONSENSUS_EPOCH_START = 0; // The starting consensus epoch to consult.
    const MAX_NUM_OF_EPOCH = 1;      // The maximum number of epochs to consult.
    // ##### DO NOT MAKE ANY MORE CHANGES TO THE SCRIPT #####

    // This is the contract address for the Forger Stake Delegation contract. DO NOT CHANGE THIS VALUE.
    const contractAddress = "0x0000000000000000000022222222222222222333";
    const abi = require("./abi/forger_stake_v2.json");
    const contract = new web3.eth.Contract(abi, contractAddress);

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


    await contract.methods.rewardsReceived(blockSignPublicKey, first32BytesForgerVrfPublicKey, lastByteForgerVrfPublicKey, CONSENSUS_EPOCH_START, MAX_NUM_OF_EPOCH).call().then(console.log);

  } catch (e) {
    console.log("Error:" + e.message);
  }
})()
