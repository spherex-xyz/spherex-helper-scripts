const { ethers } = require("hardhat");
const fs = require("fs");
const hre = require("hardhat");
const assert = require("assert");

// ~~~~~~~~~~~ SETTINGS ~~~~~~~~~~~
// this assume the owner and the operator will be the same address (if this is not the case the script should be altered).
const ALLOWED_SENDER_PATH =
  "/Users/eyalfine/Projects/spherex-helper-contracts/spherex-helper-scripts/data/cliplineaallowedsenders.json";
const ALLOWED_PATTWERNS_PATH =
  "/Users/eyalfine/Projects/spherex-helper-contracts/spherex-helper-scripts/data/cliplineaallowenpatterns.json";
const LOCAL_FORK = true;

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
    const allowedPaternsRaw = fs.readFileSync(ALLOWED_PATTWERNS_PATH, "utf8");
    allowedPatterns = JSON.parse(allowedPaternsRaw);
    console.log("allowedPatterns data loaded");
  } catch (err) {
    console.error("Error reading or parsing file:", err);
    return;
  }

  let owner;
  if (LOCAL_FORK) {
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

  const SpherexEngine = await ethers.getContractFactory("SphereXEngine");
  const spherexEngine = await SpherexEngine.deploy();
  console.log("engine address is " + spherexEngine.target);

  await spherexEngine.addAllowedSender(allowedSenders);
  console.log("allowed senders added");
  const chunkSize = 50;

  for (let i = 0; i < allowedPatterns.length; i += chunkSize) {
    const chunk = allowedPatterns.slice(i, i + chunkSize);
    await spherexEngine.addAllowedPatterns(chunk);
    console.log(
      "added " + i + " out of " + allowedPatterns.length + " patterns"
    );
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
