require("@nomicfoundation/hardhat-toolbox");
require("@nomicfoundation/hardhat-verify");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.24",
  defaultNetwork: "sepolia",
  networks: {
    hardhat: {
      forking: {
        url: "https://rpc.linea.build",
        enabled: true,
      },
      chains: {
        59144: {
          hardforkHistory: {
            shanghai: 1,
          },
        },
      },
    },
    sepolia: {
      url: "https://sepolia.infura.io/v3/aa26b18b8e6f411b8240aa3a988f74f4",
    },
  },
  etherscan: {
    apiKey: "R9K5I7B72G6PM3R41433MGTXT9PPPQX2J3", // TODO: do not upload this to a public repository
  },
};
