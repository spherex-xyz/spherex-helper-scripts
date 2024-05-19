require("@nomicfoundation/hardhat-toolbox");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.24",
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
  },
};
