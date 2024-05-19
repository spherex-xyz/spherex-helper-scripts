const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");
const hre = require("hardhat");
const assert = require("assert");

// ~~~~~~~~~~~ SETTINGS ~~~~~~~~~~~
// this assume the owner and the operator will be the same address (if this is not the case the script should be altered).
const SPHEREX_OPERATOR_ADDRESS = "0x0000000000000000000000000000000000001337";
const SPHEREX_ENGINE_ADDRESS = "0x0000000000000000000000000000000000001337";
const CONTRACTS_DATA_PATH = "";

// ~~~~~~~~~~~ SPHERX ABI ~~~~~~~~~~~

const PROTECTED_MINI_ABI = [
  {
    inputs: [
      {
        internalType: "address",
        name: "newSphereXEngine",
        type: "address",
      },
    ],
    name: "changeSphereXEngine",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "newSphereXOperator",
        type: "address",
      },
    ],
    name: "changeSphereXOperator",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },

  {
    inputs: [],
    name: "sphereXAdmin",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "sphereXEngine",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "sphereXOperator",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
];

const PROTECTED_PROXY_MINI_ABI = [
  {
    inputs: [
      {
        internalType: "bytes4[]",
        name: "keys",
        type: "bytes4[]",
      },
    ],
    name: "addProtectedFuncSigs",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
];

const ENGINE_MINI_ABI = [
  {
    type: "function",
    name: "supportsInterface",
    inputs: [
      {
        name: "interfaceId",
        type: "bytes4",
        internalType: "bytes4",
      },
    ],
    outputs: [
      {
        name: "",
        type: "bool",
        internalType: "bool",
      },
    ],
    stateMutability: "view",
  },
];

// ISphereXEngine interface id
const ENGINE_SUPPORTS_INTERFACE_DATA = "0x53e41baa";

async function main() {
  console.log("Starting script");
  let contractsData;
  try {
    const data = fs.readFileSync(CONTRACTS_DATA_PATH, "utf8");
    contractsData = JSON.parse(data);
    console.log("Contracts data loaded");
  } catch (err) {
    console.error("Error reading or parsing file:", err);
    return;
  }

  // ~~~~~~~~~~~ HELPERS ~~~~~~~~~~~

  // used for real chain interaction.
  // [owner] = await ethers.getSigners();

  // used for testing in local fork
  await hre.network.provider.request({
    method: "hardhat_impersonateAccount",
    params: ["0x0000619b2b909a6a422c18eb804b92f798370705"],
  });
  const owner = await ethers.provider.getSigner(
    "0x0000619b2b909a6a422c18eb804b92f798370705"
  );
  const engineContract = await ethers.getContractAt(
    ENGINE_MINI_ABI,
    SPHEREX_ENGINE_ADDRESS,
    owner
  );
  const supportEngine = await engineContract.supportsInterface(
    ENGINE_SUPPORTS_INTERFACE_DATA
  );
  assert(supportEngine);

  // ~~~~~~~~~~~ CHANGE SPHEREX OPERATOR ~~~~~~~~~~~
  for (contract in contractsData) {
    console.log(
      "Changing SphereX operator and engine for:",
      contractsData[contract]["address"]
    );
    const protected = await ethers.getContractAt(
      PROTECTED_MINI_ABI,
      contractsData[contract]["address"],
      owner
    );
    try {
      await (
        await protected.changeSphereXOperator(SPHEREX_OPERATOR_ADDRESS)
      ).wait();
      const sphereXOperator = await protected.sphereXOperator();
      assert(sphereXOperator === SPHEREX_OPERATOR_ADDRESS);

      console.log("SphereX operator changed");
      if ("selectors" in contractsData[contract]) {
        const protectedProxy = await ethers.getContractAt(
          PROTECTED_PROXY_MINI_ABI,
          contractsData[contract]["address"],
          owner
        );
        await (
          await protectedProxy.addProtectedFuncSigs(
            contractsData[contract]["selectors"]
          )
        ).wait();
        console.log("Selectors added");
      }

      // this eill fail in local fork if no real engine was depolied to it before.
      await (
        await protected.changeSphereXEngine(SPHEREX_ENGINE_ADDRESS)
      ).wait();
      console.log("SphereX engine changed");
    } catch (e) {
      console.log(e);
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
