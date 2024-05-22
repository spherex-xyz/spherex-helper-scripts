require("@nomicfoundation/hardhat-toolbox");
require("@nomicfoundation/hardhat-verify");
require("dotenv").config();

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
      url: `https://sepolia.infura.io/v3/${process.env.INFURA_KEY}`,
      accounts: [process.env.PRIVATE_KEY],
    },
  },
  etherscan: {
    apiKey: "R9K5I7B72G6PM3R41433MGTXT9PPPQX2J3", // TODO: do not upload this to a public repository
  },
};
