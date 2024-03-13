import dotenv from "dotenv";
import fs from "fs";
import readline from "readline";
import {Web3} from "web3";
import {parseAndValidatePrivateKey} from "web3-eth-accounts";
import {bytesToHex, numberToHex} from "web3-utils";
import * as ethereumCryptography from "ethereum-cryptography/secp256k1.js";

dotenv.config();

const validateEnvVars = (operation, envVarsToVerify) => {
  envVarsToVerify.forEach((envVar) => {
    if (!process.env[envVar]) {
      console.log(`Please set the ${envVar} environment variable required for ${operation} operation`);
      process.exit(1);
    }
  });
}

const setNetwork = () => {
  const network = process.env.NETWORK;
  if (network === "eon") {
    return "https://eon-rpc.horizenlabs.io/ethv1";
  } else if (network === "gobi") {
    return "https://gobi-rpc.horizenlabs.io/ethv1";
  } else {
    console.log("Please set the network environment variable to eon or gobi.");
    process.exit(1);
  }
}

const initializeWeb3AndContract = () => {
  const contractAddress = "0x0000000000000000000022222222222222222222";
  const jsonString = fs.readFileSync("./src/abi/forger_stake_delegation.json", "utf8");
  const abi = JSON.parse(jsonString);
  const rpcUrl = setNetwork();
  const web3 = new Web3(new Web3.providers.HttpProvider(rpcUrl));
  const contract = new web3.eth.Contract(abi, contractAddress);
  return {contract, web3};
}

const getOperation = () => {
  return new Promise((resolve) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
    const operations = {
      1: "getAllForgerStakes",
      2: "delegate",
      3: "withdraw",
      4: "stakeOf",
      5: "getPagedForgersStakes",
      6: "getPagedForgersStakesByUser",
      7: "exit"
    };
    rl.question("Please chose one of the following operations: 1. getAllForgerStakes, 2. delegate, 3. withdraw, 4. stakeOf, 5. getPagedForgersStakes, 6. getPagedForgersStakesByUser, 7. exit\n", (answer) => {
      const operation = operations[answer];
      rl.close();
      if (!operation) {
        console.log("Invalid operation, please type one of the following numbers: 1, 2, 3, 4, 5, 6 or 7\n");
        resolve(getOperation());
      } else if (operation === "exit") {
        console.log("Exiting...");
        process.exit(0);
      } else {
        resolve(operation);
      }
    });
  });
};

const signAndSend = async (web3, contract, data, value, gasLimit = null) => {
  console.log("\nSigning and sending transaction...");
  const tx = {
    from: process.env.FROM_ADDRESS,
    to: contract.options.address,
    maxPriorityFeePerGas: Number.parseInt((Number(process.env.MAX_PRIORITY_FEE_PER_GAS)).toFixed(0), 10),
    maxFeePerGas: Number.parseInt((Number(process.env.MAX_PRIORITY_FEE_PER_GAS)).toFixed(0), 10),
    value: value,
    data: data
  };
  if (gasLimit) {
    tx.gasLimit = gasLimit;
  }
  console.log("\nTransaction: " + JSON.stringify(tx));
  console.log("\nSigning transaction...")
  let privateKey = process.env.PRIVATE_KEY;
  if (!privateKey.startsWith("0x")) {
    privateKey = "0x" + privateKey;
  }
  const signedTransaction = await web3.eth.accounts.signTransaction(tx, privateKey);
  console.log("\nSigned transaction: " + signedTransaction.rawTransaction);
  console.log("\nSending transaction...")
  await web3.eth.sendSignedTransaction(signedTransaction.rawTransaction).then(console.log).catch(console.error);
}

const getAllForgerStakes = async () => {
  console.log("\nRunning getAllForgerStakes script...");
  validateEnvVars(
    "getAllForgerStakes",
    ["NETWORK"]
  );
  const {contract} = initializeWeb3AndContract();
  await contract.methods.getAllForgersStakes().call().then(console.log);
}

const prepareDelegateData = (contract, address) => {
  console.log("\nPreparing delegate data...");
  let blockSignPublicKey = process.env.BLOCK_SIGN_PUBLIC_KEY;
  let forgerVrfPublicKey = process.env.FORGER_VRF_PUBLIC_KEY;
  if (!blockSignPublicKey.startsWith("0x")) {
    blockSignPublicKey = "0x" + blockSignPublicKey;
  }
  if (!forgerVrfPublicKey.startsWith("0x")) {
    forgerVrfPublicKey = "0x" + forgerVrfPublicKey;
  }
  const first32BytesForgerVrfPublicKey = forgerVrfPublicKey.substring(0, 66);
  const lastByteForgerVrfPublicKey = "0x" + forgerVrfPublicKey.substring(66, 68);

  return contract.methods.delegate(blockSignPublicKey, first32BytesForgerVrfPublicKey, lastByteForgerVrfPublicKey, address).encodeABI();
}

const delegate = async () => {
  console.log("\nRunning delegate script...")
  validateEnvVars(
    "delegate",
    ["FROM_ADDRESS", "PRIVATE_KEY", "MAX_PRIORITY_FEE_PER_GAS", "MAX_FEE_PER_GAS", "AMOUNT_TO_SEND", "BLOCK_SIGN_PUBLIC_KEY", "FORGER_VRF_PUBLIC_KEY", "NETWORK"]
  );
  const {contract, web3} = initializeWeb3AndContract();
  const address = process.env.FROM_ADDRESS;
  const value = web3.utils.toWei(process.env.AMOUNT_TO_SEND, "ether");
  const data = prepareDelegateData(contract, address);
  await signAndSend(web3, contract, data, value);
}

// This method is used instead of web3.eth.account.sign(msg, privateKey) because the withdraw endpoint requires a
// different hash message signed. It needs to be hashed with web3.utils.sha3(data).
const sign = (msg, web3, ownerPrivateKey) => {
  const privateKeyUint8Array = parseAndValidatePrivateKey(ownerPrivateKey);
  const hash = web3.utils.sha3(msg);
  const secp256k1 = ethereumCryptography.secp256k1 ?? ethereumCryptography;
  const signature = secp256k1.sign(hash.substring(2), privateKeyUint8Array);
  const signatureBytes = signature.toCompactRawBytes();
  const r = signature.r.toString(16).padStart(64, "0");
  const s = signature.s.toString(16).padStart(64, "0");
  const v = signature.recovery + 27;
  return {
    message: msg,
    messageHash: hash,
    v: numberToHex(v),
    r: `0x${r}`,
    s: `0x${s}`,
    signature: `${bytesToHex(signatureBytes)}${v.toString(16)}`,
  };
};

const prepareWithdrawData = async (web3, contract, callerAddress, stakeId, ownerPrivateKey) => {
  console.log("\nPreparing withdraw data...");
  let signature = process.env.OWNER_SIGNED_MESSAGE;
  let v;
  let r;
  let s;
  if (!signature) {
    const nonce = await web3.eth.getTransactionCount(callerAddress);
    let nonce_s = nonce.toString(16);
    if (nonce_s.length % 2 > 0) {
      nonce_s = "0" + nonce_s;
    }
    const msg = callerAddress + nonce_s + stakeId.substring(2);
    console.log("Message to sign: " + msg);
    const signatureObject = sign(msg, web3, ownerPrivateKey);
    console.log("SignatureObject: " + JSON.stringify(signatureObject));
    v = signatureObject.v;
    r = signatureObject.r;
    s = signatureObject.s;
  } else {
    console.log('Signature: "' + signature);
    r = '0x' + signature.substring(2, 66);
    s = '0x' + signature.substring(66, 130);
    v = '0x' + signature.substring(130, 132);
  }

  return contract.methods.withdraw(stakeId, v, r, s).encodeABI();
}

const withdraw = async () => {
  console.log("\nRunning withdraw script...")
  validateEnvVars(
    "delegate",
    ["FROM_ADDRESS", "PRIVATE_KEY", "MAX_PRIORITY_FEE_PER_GAS", "MAX_FEE_PER_GAS", "GAS_LIMIT", "STAKE_ID", "NETWORK"]
  );
  const {contract, web3} = initializeWeb3AndContract();
  const callerAddress = process.env.FROM_ADDRESS;
  const stakeId = process.env.STAKE_ID;
  const value = 0;
  let ownerPrivateKey = process.env.OWNER_PRIVATE_KEY ? process.env.OWNER_PRIVATE_KEY : process.env.PRIVATE_KEY;
  if (!ownerPrivateKey.startsWith("0x")) {
    ownerPrivateKey = "0x" + ownerPrivateKey;
  }
  const gasLimit = process.env.GAS_LIMIT;
  const data = await prepareWithdrawData(web3, contract, callerAddress, stakeId, ownerPrivateKey);
  await signAndSend(web3, contract, data, value, gasLimit);
}

const stakeOf = async () => {
  console.log("\nRunning stakeOf script...");
  validateEnvVars(
    "stakeOf",
    ["NETWORK", "STAKE_OF_OWNER_ADDRESS"]
  );
  const ownerAddress = process.env.STAKE_OF_OWNER_ADDRESS;
  const {contract} = initializeWeb3AndContract();
  await contract.methods.stakeOf(ownerAddress).call().then(console.log);
}

const getPagedForgersStakes = async () => {
  console.log("\nRunning getPagedForgersStakes script...");
  validateEnvVars(
    "getPagedForgersStakes",
    ["NETWORK"]
  );
  const startIndex = process.env.PFS_START_INDEX ? Number.parseInt((Number(process.env.PFS_START_INDEX)).toFixed(0), 10) : 0;
  const pageSize = process.env.PFS_PAGE_SIZE ? Number.parseInt((Number(process.env.PFS_PAGE_SIZE)).toFixed(0), 10) : 10;

  const {contract} = initializeWeb3AndContract();
  await contract.methods.getPagedForgersStakes(startIndex, pageSize).call().then(console.log);
}

const getPagedForgersStakesByUser = async () => {
  console.log("\nRunning getPagedForgersStakesByUser script...");
  validateEnvVars(
    "getPagedForgersStakesByUser",
    ["NETWORK", "PFSBU_OWNER_ADDRESS"]
  );
  const ownerAddress = process.env.PFSBU_OWNER_ADDRESS;
  const startIndex = process.env.PFSBU_START_INDEX ? Number.parseInt((Number(process.env.PFSBU_START_INDEX)).toFixed(0), 10) : 0;
  const pageSize = process.env.PFSBU_PAGE_SIZE ? Number.parseInt((Number(process.env.PFSBU_PAGE_SIZE)).toFixed(0), 10) : 10;
  const {contract} = initializeWeb3AndContract();
  await contract.methods.getPagedForgersStakesByUser(ownerAddress, startIndex, pageSize).call().then(console.log);
}

const run = async () => {
  const operation = await getOperation();
  console.log(`Operation: ${operation}`);
  try {
    switch (operation) {
      case "getAllForgerStakes":
        await getAllForgerStakes();
        break;
      case "delegate":
        await delegate();
        break;
      case "withdraw":
        await withdraw();
        break;
      case "stakeOf":
        await stakeOf();
        break;
      case "getPagedForgersStakes":
        await getPagedForgersStakes();
        break;
      case "getPagedForgersStakesByUser":
        await getPagedForgersStakesByUser();
        break;
      default:
        console.log("Invalid operation");
    }
  } catch (e) {
    console.log(e);
  }
};

run().then(() => console.log("\nDone"));
