const { ethers } = require("hardhat");
const hre = require("hardhat");

// ~~~~~~~~~~~ SETTINGS ~~~~~~~~~~~
// this assume the owner and the operator will be the same address (if this is not the case the script should be altered).
const ENGINE_ADDRESS = "";
const LOCAL_FORK = true;
const HARDHAT_TEST_WALLET = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266";

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

  const response = await spherexEngine.connect(owner).deactivateAllRules();
  const receipt = await ethers.provider.getTransactionReceipt(response.hash);
  if (receipt.status == 0) {
    console.error("Transaction failed");
    return;
  }
  console.error("Engine is now turned off");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
