// Right-click on the script name and hit "Run" to execute
(async () => {
  try {
    console.log('Running forging stake script - getCurrentConsensusEpoch...');
    // This is the contract address for the Forger Stake Delegation contract. DO NOT CHANGE THIS VALUE.
    const contractAddress = "0x0000000000000000000022222222222222222333";
    const abi = require("./abi/forger_stake_v2.json");
    const contract = new web3.eth.Contract(abi, contractAddress);

    await contract.methods.getCurrentConsensusEpoch().call().then(console.log);

  } catch (e) {
    console.log("Error:" + e.message);
  }
})()
