const { ethers } = require("hardhat");
const fs = require("fs");
const hre = require("hardhat");
const assert = require("assert");

// ~~~~~~~~~~~ SETTINGS ~~~~~~~~~~~

const ENGINE_ADDRESS = "";
const LOCAL_FORK = true;
const HARDHAT_TEST_WALLET = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266";

// Add the patterns to the array as array of strings
const patterns = [];

async function main() {
  console.log("Starting script");

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

  const PATTERN_CHUNK_SIZE = 50;
  let patternsAdded = 0;

  for (let i = 0; i < patterns.length; i += PATTERN_CHUNK_SIZE) {
    const chunk = patterns.slice(i, i + PATTERN_CHUNK_SIZE);
    await spherexEngine.connect(owner).addAllowedPatterns(chunk);
    patternsAdded += chunk.length;
    console.log(
      "added " + patternsAdded + " out of " + patterns.length + " patterns"
    );
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
