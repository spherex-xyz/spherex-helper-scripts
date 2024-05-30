const { ethers } = require("hardhat");
const fs = require("fs");
const hre = require("hardhat");
const assert = require("assert");

// ~~~~~~~~~~~ SETTINGS ~~~~~~~~~~~
// this assume the owner and the operator will be the same address (if this is not the case the script should be altered).
const ALLOWED_SENDER_PATH = "";
const ALLOWED_PATTERNS_PATH = "";
const ENGINE_ADDRESS = "";
const LOCAL_FORK = true;
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
  if (LOCAL_FORK) {
    console.log("Running on local fork");
    console.log(HARDHAT_TEST_WALLET);
    await hre.network.provider.request({
      method: "hardhat_impersonateAccount",
      params: [HARDHAT_TEST_WALLET],
    });
    owner = await ethers.provider.getSigner(HARDHAT_TEST_WALLET);
  } else {
    console.log("Running on real chain");
    [owner] = await ethers.getSigners();
  }
  const spherexEngine = await ethers.getContractAt(
    "SphereXEngine",
    ENGINE_ADDRESS
  );

  console.log("engine address is " + spherexEngine.target);

  await spherexEngine.connect(owner).addAllowedSender(allowedSenders);
  console.log("allowed senders added");

  const PATTERN_CHUNK_SIZE = 50;
  let patternsAdded = 0;

  for (let i = 0; i < allowedPatterns.length; i += PATTERN_CHUNK_SIZE) {
    const chunk = allowedPatterns.slice(i, i + PATTERN_CHUNK_SIZE);
    await spherexEngine.connect(owner).addAllowedPatterns(chunk);
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
