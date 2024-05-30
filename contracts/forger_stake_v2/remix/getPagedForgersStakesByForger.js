// Right-click on the script name and hit "Run" to execute
(async () => {
  try {
    console.log('Running forging stake script - getPagedForgersStakesByForger...');

    // ##### ONLY SET THE FOLLOWING VALUES #####
    const YOUR_BLOCK_SIGN_PUBKEY = ""; // The public key that will sign the block when forged; populate this with the value of "Block Sign Public Key" from the forger.
    const YOUR_VRF_PUBKEY = "";        // The "VRF Public Key" of the forger.
    const START_INDEX = 0;           // Initial stake index to be returned. Update this value to get the next page.
    const PAGE_SIZE = 10;            // Number of stakes to be returned. Update this value to get more or less stakes.
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

    await contract.methods.getPagedForgersStakesByForger(blockSignPublicKey,first32BytesForgerVrfPublicKey,lastByteForgerVrfPublicKey, START_INDEX, PAGE_SIZE).call().then(response => {
      console.log({
        nextIndex: response["0"],
        stakes: response["1"]
      })
    });

  } catch (e) {
    console.log("Error:" + e.message);
  }
})()
