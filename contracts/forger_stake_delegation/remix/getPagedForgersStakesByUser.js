// Right-click on the script name and hit "Run" to execute
(async () => {
  try {
    console.log('Running forging stake script - getPagedForgersStakes...');

    // ##### ONLY SET THE FOLLOWING VALUES #####
    const OWNER_ADDRESS = "";       // If owner is different from caller, specify it here.
    const START_INDEX = 0;        // Initial stake index to be returned. Update this value to get the next page.
    const PAGE_SIZE = 10;         // Number of stakes to be returned. Update this value to get more or less stakes.
    // ##### DO NOT MAKE ANY MORE CHANGES TO THE SCRIPT #####

    const accounts = await web3.eth.getAccounts();
    const callerAddress = accounts[0];
    const ownerAddress = !OWNER_ADDRESS ? callerAddress : OWNER_ADDRESS;

    // This is the contract address for the Forger Stake Delegation contract. DO NOT CHANGE THIS VALUE.
    const contractAddress = "0x0000000000000000000022222222222222222222";
    const abi = require("./abi/forger_stake_delegation.json");
    const contract = new web3.eth.Contract(abi, contractAddress);

    await contract.methods.getPagedForgersStakes(ownerAddress, START_INDEX, PAGE_SIZE).call().then(console.log);

  } catch (e) {
    console.log("Error:" + e.message);
  }
})()
