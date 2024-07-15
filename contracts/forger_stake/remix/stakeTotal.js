// Right-click on the script name and hit "Run" to execute

/*
   Returns the total stake amount, at the end of one or more consensus epochs, assigned to a specific forger.
   vrf, signKey and delegator are optional: if all are null, the total stake amount will be returned. If only
   delegator is null, all the stakes assigned to the forger will be summed.
   If vrf and signKey are null, but delegator is defined, the method will fail.
   consensusEpochStart and maxNumOfEpoch are optional: if both null, the data at the current consensus epoch is returned.
   Returned array contains also elements with 0 value. Returned values are ordered by epoch, and the array length may
   be < maxNumOfEpoch if the current consensus epoch is < (consensusEpochStart + maxNumOfEpoch) or if the forger was
   registered after consensusEpochStart.
*/
(async () => {
  try {
    console.log('Running forging stake script - stakeTotal...');

    const NULL_BYTE_20 = "0x0000000000000000000000000000000000000000";
    const NULL_BYTE_32 = "0x0000000000000000000000000000000000000000000000000000000000000000";
    const NULL_BYTE_33 = "0x000000000000000000000000000000000000000000000000000000000000000000";

    // ##### ONLY SET THE FOLLOWING VALUES #####
    const YOUR_BLOCK_SIGN_PUBKEY = NULL_BYTE_32;  // The public key that will sign the block when forged; populate this with the value of "Block Sign Public Key" from the forger.
    const YOUR_VRF_PUBKEY = NULL_BYTE_33;         // The "VRF Public Key" of the forger.
    const DELEGATOR_ADDRESS = NULL_BYTE_20;       // The delegator address to consult.
    const CONSENSUS_EPOCH_START = 0;            // The starting consensus epoch to consult. If 0, the current consensus epoch is used.
    const MAX_NUM_OF_EPOCH = 0;                 // The maximum number of epochs to consult. If 0, only the data at the consensus epoch selected is returned.
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

    let delegatorAddress = DELEGATOR_ADDRESS;
    if (delegatorAddress !== NULL_BYTE_20 && !delegatorAddress.startsWith("0x")) {
      delegatorAddress = "0x" + delegatorAddress;
    }

    if (delegatorAddress !== NULL_BYTE_20 && (blockSignPublicKey === NULL_BYTE_32 || forgerVrfPublicKey === NULL_BYTE_33)) {
      console.log("Error: delegator address is defined, but VRF and signKey are not.");
      return;
    }

    await contract.methods.stakeTotal(blockSignPublicKey,first32BytesForgerVrfPublicKey,lastByteForgerVrfPublicKey, delegatorAddress, CONSENSUS_EPOCH_START, MAX_NUM_OF_EPOCH).call().then(console.log);

  } catch (e) {
    console.log("Error:" + e.message);
  }
})()
