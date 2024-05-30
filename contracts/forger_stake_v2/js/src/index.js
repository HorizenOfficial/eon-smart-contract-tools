import dotenv from "dotenv";
import fs from "fs";
import readline from "readline";
import {Web3} from "web3";

dotenv.config();

const SMART_CONTRACT_ABI = "./src/abi/forger_stake_v2.json";
const SMART_CONTRACT_ADDRESS = "0x0000000000000000000022222222222222222333";
const NULL_BYTE_20 = "0x0000000000000000000000000000000000000000";
const NULL_BYTE_32 = "0x0000000000000000000000000000000000000000000000000000000000000000";
const NULL_BYTE_33 = "0x000000000000000000000000000000000000000000000000000000000000000000";
const NULL_INT = 0;

const stringToUint32 = (name, str) => {
  const num = Number(str);
  if (!Number.isSafeInteger(num) || num < 0 || num > 4294967295) {
    throw new Error(`Number '${name}'=${str} is too large, too small, or cannot be accurately represented`);
  }
  return Number.parseInt(num.toFixed(0), 10);
};

const validateEnvVars = (operation, envVarsToVerify) => {
  envVarsToVerify.forEach((envVar) => {
    if (!process.env[envVar]) {
      throw new Error(`Please set the ${envVar} environment variable required for ${operation} operation`);
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
    throw new Error("Please set the network environment variable to eon or gobi.");
  }
}

const initializeWeb3AndContract = () => {
  const contractAddress = SMART_CONTRACT_ADDRESS;
  const jsonString = fs.readFileSync(SMART_CONTRACT_ABI, "utf8");
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
      1: getCurrentConsensusEpoch,
      2: delegate,
      3: withdraw,
      4: stakeStart,
      5: stakeTotal,
      6: rewardsReceived,
      7: getForger,
      8: getPagedForgers,
      9: getPagedForgersStakesByDelegator,
      10: getPagedForgersStakesByForger,
      11: exit
    };
    let operationsStr = '';
    for (const key in operations) {
      operationsStr += `${key})\t${operations[key].name}\n`;
    }
    rl.question(`Please chose one of the following operations: \n${operationsStr}\n`, (answer) => {
      const operation = operations[answer];
      rl.close();
      if (!operation) {
        console.log("Invalid operation, please type one of the following numbers: 1 - 10\n");
        resolve(getOperation());
      } else {
        resolve(operation);
      }
    });
  });
};

const prepareForgerKeys = (blockSignPublicKey, vrfPublicKey) => {
  console.log("\nPreparing forger keys...");
  if (!blockSignPublicKey.startsWith("0x")) {
    blockSignPublicKey = "0x" + blockSignPublicKey;
  }
  if (!vrfPublicKey.startsWith("0x")) {
    vrfPublicKey = "0x" + vrfPublicKey;
  }
  const first32BytesForgerVrfPublicKey = vrfPublicKey.substring(0, 66);
  const lastByteForgerVrfPublicKey = "0x" + vrfPublicKey.substring(66, 68);
  return {blockSignPublicKey, first32BytesForgerVrfPublicKey, lastByteForgerVrfPublicKey};
}

const signAndSend = async (web3, contract, address, privateKey, data, value, gasLimit = null) => {
  console.log("\nSigning and sending transaction...");
  const tx = {
    from: address,
    to: contract.options.address,
    maxPriorityFeePerGas: process.env.MAX_PRIORITY_FEE_PER_GAS,
    maxFeePerGas: process.env.MAX_PRIORITY_FEE_PER_GAS,
    value: value,
    data: data
  };
  if (gasLimit) {
    tx.gasLimit = gasLimit;
  }
  console.log("\nTransaction: " + JSON.stringify(tx));
  console.log("\nSigning transaction...")
  if (!privateKey.startsWith("0x")) {
    privateKey = "0x" + privateKey;
  }
  const signedTransaction = await web3.eth.accounts.signTransaction(tx, privateKey);
  console.log("\nSigned transaction: " + signedTransaction.rawTransaction);
  console.log("\nSending transaction...")
  await web3.eth.sendSignedTransaction(signedTransaction.rawTransaction).then(console.log).catch(console.error);
}

const getCurrentConsensusEpoch = async () => {
  console.log("\nRunning getCurrentConsensusEpoch script...");
  validateEnvVars(
    "getCurrentConsensusEpoch",
    ["NETWORK"]
  );
  const {contract} = initializeWeb3AndContract();
  await contract.methods.getCurrentConsensusEpoch().call().then(console.log);
}

const delegate = async () => {
  console.log("\nRunning delegate script...")
  validateEnvVars(
    "delegate",
    [
      "NETWORK",
      "MAX_PRIORITY_FEE_PER_GAS",
      "MAX_FEE_PER_GAS",
      "DELEGATE_FROM_ADDRESS",
      "DELEGATE_PRIVATE_KEY",
      "DELEGATE_BLOCK_SIGN_PUBLIC_KEY",
      "DELEGATE_VRF_PUBLIC_KEY",
      "DELEGATE_AMOUNT"
    ]
  );
  const {contract, web3} = initializeWeb3AndContract();
  const address = process.env.DELEGATE_FROM_ADDRESS;
  const privateKey = process.env.DELEGATE_PRIVATE_KEY;
  const value = web3.utils.toWei(process.env.DELEGATE_AMOUNT, "ether");
  const {
    blockSignPublicKey,
    first32BytesForgerVrfPublicKey,
    lastByteForgerVrfPublicKey
  } = prepareForgerKeys(process.env.DELEGATE_BLOCK_SIGN_PUBLIC_KEY, process.env.DELEGATE_VRF_PUBLIC_KEY);
  const data = contract.methods.delegate(blockSignPublicKey, first32BytesForgerVrfPublicKey, lastByteForgerVrfPublicKey).encodeABI();
  console.log("Data: " + data)
  await signAndSend(web3, contract, address, privateKey, data, value);
}

const withdraw = async () => {
  console.log("\nRunning withdraw script...")
  validateEnvVars(
    "withdraw",
    [
      "NETWORK",
      "MAX_PRIORITY_FEE_PER_GAS",
      "MAX_FEE_PER_GAS",
      "GAS_LIMIT",
      "WITHDRAW_FROM_ADDRESS",
      "WITHDRAW_PRIVATE_KEY",
      "WITHDRAW_BLOCK_SIGN_PUBLIC_KEY",
      "WITHDRAW_VRF_PUBLIC_KEY",
      "WITHDRAW_AMOUNT"
    ]
  );
  const {contract, web3} = initializeWeb3AndContract();
  const address = process.env.WITHDRAW_FROM_ADDRESS;
  const privateKey = process.env.WITHDRAW_PRIVATE_KEY;
  const value = web3.utils.toWei(process.env.WITHDRAW_AMOUNT, "ether");
  const gasLimit = process.env.GAS_LIMIT;
  const {
    blockSignPublicKey,
    first32BytesForgerVrfPublicKey,
    lastByteForgerVrfPublicKey
  } = prepareForgerKeys(process.env.WITHDRAW_BLOCK_SIGN_PUBLIC_KEY, process.env.WITHDRAW_VRF_PUBLIC_KEY);
  const data = contract.methods.withdraw(blockSignPublicKey, first32BytesForgerVrfPublicKey, lastByteForgerVrfPublicKey, value).encodeABI();
  await signAndSend(web3, contract, address, privateKey, data, 0, gasLimit);
}

const stakeStart = async () => {
  console.log("\nRunning stakeStart script...");
  validateEnvVars(
    "stakeStart",
    [
      "NETWORK",
      "STAKE_START_BLOCK_SIGN_PUBLIC_KEY",
      "STAKE_START_VRF_PUBLIC_KEY",
      "STAKE_START_DELEGATOR_ADDRESS"
    ]
  );

  const stakeStartBlockSignPublicKey = process.env.STAKE_START_BLOCK_SIGN_PUBLIC_KEY;
  const stakeStartVrfPublicKey = process.env.STAKE_START_VRF_PUBLIC_KEY;
  const delegatorAddress = process.env.STAKE_START_DELEGATOR_ADDRESS;

  const {
    blockSignPublicKey,
    first32BytesForgerVrfPublicKey,
    lastByteForgerVrfPublicKey
  } = prepareForgerKeys(stakeStartBlockSignPublicKey, stakeStartVrfPublicKey);

  const {contract} = initializeWeb3AndContract();
  await contract.methods.stakeStart(blockSignPublicKey, first32BytesForgerVrfPublicKey, lastByteForgerVrfPublicKey, delegatorAddress).call().then(console.log);
}

const stakeTotal = async () => {
  console.log("\nRunning stakeTotal script...");
  validateEnvVars(
    "stakeTotal",
    ["NETWORK"]
  );

  const stakeTotalBlockSignPublicKey = process.env.STAKE_TOTAL_BLOCK_SIGN_PUBLIC_KEY ? process.env.STAKE_TOTAL_BLOCK_SIGN_PUBLIC_KEY : NULL_BYTE_32;
  const stakeTotalVrfPublicKey = process.env.STAKE_TOTAL_VRF_PUBLIC_KEY ? process.env.STAKE_TOTAL_VRF_PUBLIC_KEY : NULL_BYTE_33;
  const delegatorAddress = process.env.STAKE_TOTAL_DELEGATOR_ADDRESS ? process.env.STAKE_TOTAL_DELEGATOR_ADDRESS : NULL_BYTE_20;
  const consensusEpochStart = process.env.STAKE_TOTAL_CONSENSUS_EPOCH_START ? stringToUint32("STAKE_TOTAL_CONSENSUS_EPOCH_START", process.env.STAKE_TOTAL_CONSENSUS_EPOCH_START) : NULL_INT;
  const maxNumOfEpoch = process.env.STAKE_TOTAL_MAX_NUM_OF_EPOCH ? stringToUint32("STAKE_TOTAL_MAX_NUM_OF_EPOCH", process.env.STAKE_TOTAL_MAX_NUM_OF_EPOCH) : NULL_INT;

  if ((stakeTotalBlockSignPublicKey !== NULL_BYTE_32 && stakeTotalVrfPublicKey === NULL_BYTE_33) || (stakeTotalBlockSignPublicKey === NULL_BYTE_32 && stakeTotalVrfPublicKey !== NULL_BYTE_33)) {
    throw new Error("VRF and signKey must be defined together to identify the forger.");
  }

  if (delegatorAddress !== NULL_BYTE_20 && (stakeTotalBlockSignPublicKey === NULL_BYTE_32 || stakeTotalVrfPublicKey === NULL_BYTE_33)) {
    throw new Error("delegator address is defined, but VRF or signKey are not.");
  }

  const {
    blockSignPublicKey,
    first32BytesForgerVrfPublicKey,
    lastByteForgerVrfPublicKey
  } = prepareForgerKeys(stakeTotalBlockSignPublicKey, stakeTotalVrfPublicKey);

  const {contract} = initializeWeb3AndContract();
  await contract.methods.stakeTotal(blockSignPublicKey, first32BytesForgerVrfPublicKey, lastByteForgerVrfPublicKey, delegatorAddress, consensusEpochStart, maxNumOfEpoch).call().then(console.log);
}

const rewardsReceived = async () => {
  console.log("\nRunning rewardsReceived script...");
  validateEnvVars(
    "rewardsReceived",
    [
      "NETWORK",
      "REWARDS_RECEIVED_BLOCK_SIGN_PUBLIC_KEY",
      "REWARDS_RECEIVED_VRF_PUBLIC_KEY",
      "REWARDS_RECEIVED_CONSENSUS_EPOCH_START",
      "REWARDS_RECEIVED_MAX_NUM_OF_EPOCH"
    ]
  );

  const {
    blockSignPublicKey,
    first32BytesForgerVrfPublicKey,
    lastByteForgerVrfPublicKey
  } = prepareForgerKeys(process.env.REWARDS_RECEIVED_BLOCK_SIGN_PUBLIC_KEY, process.env.REWARDS_RECEIVED_VRF_PUBLIC_KEY);
  const consensusEpochStart = stringToUint32("STAKE_TOTAL_CONSENSUS_EPOCH_START", process.env.REWARDS_RECEIVED_CONSENSUS_EPOCH_START);
  const maxNumOfEpoch = stringToUint32("STAKE_TOTAL_MAX_NUM_OF_EPOCH", process.env.REWARDS_RECEIVED_MAX_NUM_OF_EPOCH);

  const {contract} = initializeWeb3AndContract();
  await contract.methods.rewardsReceived(blockSignPublicKey, first32BytesForgerVrfPublicKey, lastByteForgerVrfPublicKey, consensusEpochStart, maxNumOfEpoch).call().then(console.log);
}

const getForger = async () => {
  console.log("\nRunning getForger script...");
  validateEnvVars(
    "getForger",
    [
      "NETWORK",
      "GET_FORGER_BLOCK_SIGN_PUBLIC_KEY",
      "GET_FORGER_VRF_PUBLIC_KEY"
    ]
  );
  const {
    blockSignPublicKey,
    first32BytesForgerVrfPublicKey,
    lastByteForgerVrfPublicKey
  } = prepareForgerKeys(process.env.GET_FORGER_BLOCK_SIGN_PUBLIC_KEY, process.env.GET_FORGER_VRF_PUBLIC_KEY);
  console.log("blockSignPublicKey: " + blockSignPublicKey);
  console.log("first32BytesForgerVrfPublicKey: " + first32BytesForgerVrfPublicKey);
  console.log("lastByteForgerVrfPublicKey: " + lastByteForgerVrfPublicKey);
  const {contract} = initializeWeb3AndContract();
  await contract.methods.getForger(blockSignPublicKey, first32BytesForgerVrfPublicKey, lastByteForgerVrfPublicKey).call().then(console.log);
}

const getPagedForgers = async () => {
  console.log("\nRunning getPagedForgers script...");
  validateEnvVars(
    "getPagedForgers",
    [
      "NETWORK"
    ]
  );
  const startIndex = process.env.GPF_START_INDEX ? stringToUint32("GPF_START_INDEX", process.env.GPF_START_INDEX) : 0;
  const pageSize = process.env.GPF_PAGE_SIZE ? stringToUint32("GPF_PAGE_SIZE", process.env.GPF_PAGE_SIZE) : 10;
  const {contract} = initializeWeb3AndContract();
  await contract.methods.getPagedForgers(startIndex, pageSize).call().then(console.log);
}

const getPagedForgersStakesByDelegator = async () => {
  console.log("\nRunning getPagedForgersStakesByDelegator script...");
  validateEnvVars(
    "getPagedForgersStakesByDelegator",
    [
      "NETWORK",
      "GPFS_BY_DELEGATOR_ADDRESS"
    ]
  );
  const address = process.env.GPFS_BY_DELEGATOR_ADDRESS;
  const startIndex = process.env.GPFS_BY_DELEGATOR_START_INDEX ? stringToUint32("GPFS_BY_DELEGATOR_START_INDEX", process.env.GPFS_BY_DELEGATOR_START_INDEX) : 0;
  const pageSize = process.env.GPFS_BY_DELEGATOR_PAGE_SIZE ? stringToUint32("GPFS_BY_DELEGATOR_PAGE_SIZE", process.env.GPFS_BY_DELEGATOR_PAGE_SIZE) : 10;
  const {contract} = initializeWeb3AndContract();
  await contract.methods.getPagedForgersStakesByDelegator(address, startIndex, pageSize).call().then(console.log);
}

const getPagedForgersStakesByForger = async () => {
  console.log("\nRunning getPagedForgersStakesByForger script...");
  validateEnvVars(
    "getPagedForgers",
    [
      "NETWORK",
      "GPFS_BY_FORGER_BLOCK_SIGN_PUBLIC_KEY",
      "GPFS_BY_FORGER_VRF_PUBLIC_KEY"
    ]
  );
  const {
    blockSignPublicKey,
    first32BytesForgerVrfPublicKey,
    lastByteForgerVrfPublicKey
  } = prepareForgerKeys(process.env.GPFS_BY_FORGER_BLOCK_SIGN_PUBLIC_KEY, process.env.GPFS_BY_FORGER_VRF_PUBLIC_KEY);
  const startIndex = process.env.GPFS_BY_FORGER_START_INDEX ? stringToUint32("GPFS_BY_FORGER_START_INDEX", process.env.GPFS_BY_FORGER_START_INDEX) : 0;
  const pageSize = process.env.GPFS_BY_FORGER_PAGE_SIZE ? stringToUint32("GPFS_BY_FORGER_PAGE_SIZE", process.env.GPFS_BY_FORGER_PAGE_SIZE) : 10;
  const {contract} = initializeWeb3AndContract();
  await contract.methods.getPagedForgersStakesByForger(blockSignPublicKey, first32BytesForgerVrfPublicKey, lastByteForgerVrfPublicKey, startIndex, pageSize).call().then(console.log);
}

const exit = () => {
  console.log("\nExiting...");
}

const run = async () => {
  const operation = await getOperation();
  console.log(`\nOperation: ${operation.name}`);
  await operation();
};

run().then(() => console.log("\nScript completed successfully.\n")).catch((error) => console.error(`\nScript failed with error: ${error.message}\n`));
