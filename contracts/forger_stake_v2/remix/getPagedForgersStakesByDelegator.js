// Right-click on the script name and hit "Run" to execute
(async () => {
  try {
    console.log('Running forging stake script - getPagedForgersStakesByDelegator...');

    // ##### ONLY SET THE FOLLOWING VALUES #####
    const DELEGATOR_ADDRESS = "";   // The delegator address to consult.
    const START_INDEX = 0;        // Initial stake index to be returned. Update this value to get the next page.
    const PAGE_SIZE = 10;         // Number of stakes to be returned. Update this value to get more or less stakes.
    // ##### DO NOT MAKE ANY MORE CHANGES TO THE SCRIPT #####

    // This is the contract address for the Forger Stake Delegation contract. DO NOT CHANGE THIS VALUE.
    const contractAddress = "0x0000000000000000000022222222222222222333";
    const abi = require("./abi/forger_stake_v2.json");
    const contract = new web3.eth.Contract(abi, contractAddress);

    await contract.methods.getPagedForgersStakesByDelegator(DELEGATOR_ADDRESS, START_INDEX, PAGE_SIZE).call().then(response => {
      console.log({
        nextIndex: response["0"],
        stakes: response["1"]
      })
    });

  } catch (e) {
    console.log("Error:" + e.message);
  }
})()
