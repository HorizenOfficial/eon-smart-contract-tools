// Right-click on the script name and hit "Run" to execute
(async () => {
  try {
    console.log('Running forging stake script - getAllForgersStakes...');
    const address = "0x0000000000000000000022222222222222222222";
    const abi = require("./abi/forger_stake_delegation.json");
    const contract = new web3.eth.Contract(abi, address);

    await contract.methods.getAllForgersStakes().call().then(console.log);

  } catch (e) {
    console.log("Error:" + e.message);
  }
})()
