const { ethers } = require("hardhat");
const hre = require("hardhat");

// ~~~~~~~~~~~ SETTINGS ~~~~~~~~~~~
// this assume the owner and the operator will be the same address (if this is not the case the script should be altered).
const ENGINE_ADDRESS = "0x7240F10FB48379073B2b34558b0a4a9B7d05EDcf";
const LOCAL_FORK = true;
const CALL_FLOW = "0x0000000000000001";
const HARDHAT_TEST_WALLET = "0x0000619b2b909a6a422c18eb804b92f798370705";

async function main() {
  console.log("Starting script");

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
  const spherexEngine = await ethers.getContractAt(
    "SphereXEngine",
    ENGINE_ADDRESS
  );

  console.log("engine address is " + spherexEngine.target);

  const response = await spherexEngine.connect(owner).configureRules(CALL_FLOW);
  const receipt = await ethers.provider.getTransactionReceipt(response.hash);
  if (receipt.status == 0) {
    console.error("Transaction failed");
    return;
  }
  console.error("Engine is now turned on");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
