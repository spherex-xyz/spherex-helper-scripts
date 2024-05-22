const { ethers } = require("hardhat");
const fs = require("fs");
const hre = require("hardhat");
const assert = require("assert");

// ~~~~~~~~~~~ SETTINGS ~~~~~~~~~~~
// this assume the owner and the operator will be the same address (if this is not the case the script should be altered).
// TODO: clear this
const ALLOWED_SENDER_PATH = "empty_json_list.json";
const ALLOWED_PATTERNS_PATH = "empty_json_list.json";
const LOCAL_NETWORK_NAME = "hardhat";

// ~~~~~~~~~~~ SPHERX ABI ~~~~~~~~~~~
const HARDHAT_TEST_WALLET = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266";

async function main() {
  console.log("Starting script");
  let allowedSenders;
  let allowedPatterns;
  try {
    const allowedSendersRaw = fs.readFileSync(ALLOWED_SENDER_PATH, "utf8");
    allowedSenders = JSON.parse(allowedSendersRaw);
    console.log("allowedSenders data loaded");

    const allowedPatternsRaw = fs.readFileSync(ALLOWED_PATTERNS_PATH, "utf8");
    allowedPatterns = JSON.parse(allowedPatternsRaw);
    console.log("allowedPatterns data loaded");
  } catch (err) {
    console.error("Error reading or parsing file:", err);
    return;
  }

  let owner;
  if (hre.network.name == LOCAL_NETWORK_NAME) {
    console.log("Running on local fork");
    await hre.network.provider.request({
      method: "hardhat_impersonateAccount",
      params: [HARDHAT_TEST_WALLET],
    });
    owner = await ethers.provider.getSigner(HARDHAT_TEST_WALLET);
  } else {
    console.log("Running on real chain");
    [owner] = await ethers.getSigners();
  }
  console.log(`got owner ${owner}`);

  const spherexEngineFactory = await ethers.getContractFactory("SphereXEngine");
  console.log("factory created");
  const spherexEngine = await spherexEngineFactory.deploy();
  console.log("engine address is " + spherexEngine.target + ". Verifying...");
  await hre.run("verify:verify", { address: spherexEngine.target });
  console.log("verified!");

  process.exit();

  await spherexEngine.addAllowedSender(allowedSenders);
  console.log("allowed senders added");

  const PATTERN_CHUNK_SIZE = 50;
  let patternsAdded = 0;

  for (let i = 0; i < allowedPatterns.length; i += PATTERN_CHUNK_SIZE) {
    const chunk = allowedPatterns.slice(i, i + PATTERN_CHUNK_SIZE);
    await spherexEngine.addAllowedPatterns(chunk);
    patternsAdded += chunk.length;
    console.log(
      "added " +
        patternsAdded +
        " out of " +
        allowedPatterns.length +
        " patterns"
    );
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
