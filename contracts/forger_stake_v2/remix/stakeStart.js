// Right-click on the script name and hit "Run" to execute

/*
   Returns the  first consensus epoch when a stake is present for a specific delegator.
   signPubKey, vrf1, vrf2 and delegator parameters are mandatory.
   If no stake has been found (the delegator never staked anything to this forger) the method returns -1
*/
(async () => {
  try {
    console.log('Running forging stake script - stakeStart...');

    // ##### ONLY SET THE FOLLOWING VALUES #####
    const YOUR_BLOCK_SIGN_PUBKEY = "";  // The public key that will sign the block when forged; populate this with the value of "Block Sign Public Key" from the forger.
    const YOUR_VRF_PUBKEY = "";         // The "VRF Public Key" of the forger.
    const DELEGATOR_ADDRESS = "";       // The delegator address to consult. Optional. If not provided the connected address will be used.
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
    if (!delegatorAddress) {
      const accounts = await web3.eth.getAccounts();
      delegatorAddress = accounts[0];
    }

    if (!delegatorAddress.startsWith("0x")) {
      delegatorAddress = "0x" + delegatorAddress;
    }

    await contract.methods.stakeStart(blockSignPublicKey, first32BytesForgerVrfPublicKey, lastByteForgerVrfPublicKey, delegatorAddress).call().then(console.log);

  } catch (e) {
    console.log("Error:" + e.message);
  }
})()
