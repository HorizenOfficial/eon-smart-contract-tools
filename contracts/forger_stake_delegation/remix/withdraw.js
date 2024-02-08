// Right-click on the script name and hit "Run" to execute
(async () => {
  try {
    console.log('Running forging stake script - withdraw...');

    // Set the following values:
    const STAKE_ID = "";
    const OWNER_ADDRESS = "";        // If owner is different from caller, specify it here. consider that the owner has to create the signature for the message in order to allow the caller to send the transaction.
    const OWNER_SIGNED_MESSAGE = ""; // If the owner has already signed the message, paste the signature here. If not, leave it empty and the script will sign the message.

    const address = "0x0000000000000000000022222222222222222222";
    const accounts = await web3.eth.getAccounts();
    const callerAddress = accounts[0];
    const ownerAddress = !OWNER_ADDRESS ? callerAddress : OWNER_ADDRESS;
    const abi = require("./abi/forger_stake_delegation.json");
    const contract = new web3.eth.Contract(abi, address, {from: callerAddress});

    let signature = OWNER_SIGNED_MESSAGE;
    if (!signature) {
      // Creating message to sign
      // Nonce is required and has to be represented as byte array
      const nonce = await web3.eth.getTransactionCount(callerAddress);
      let nonce_s = nonce.toString(16);
      if (nonce_s.length%2 >0 ){
        nonce_s = '0' + nonce_s;
      }
      const msg = callerAddress + nonce_s + STAKE_ID.substring(2);
      console.log('Message to sign: "' + msg);
      // The owner of the stake has to sign the message
      signature = await web3.eth.sign(web3.utils.sha3(msg),ownerAddress);
    }
    console.log('Signature: "'+ signature);
    const r = '0x'+signature.substring(2, 66);
    const s = '0x'+signature.substring(66,130);
    const v = '0x'+signature.substring(130,132);

    console.log("Sending withdraw transaction...");
    await contract.methods.withdraw(STAKE_ID,v,r,s).send({value: 0}).then(console.log);

    console.log("Transaction completed.");

  } catch (e) {
    console.log("Error:" + e.message);
  }
})()
