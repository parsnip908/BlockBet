require("@nomicfoundation/hardhat-toolbox");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.24",
};

module.exports = {
  solidity: "0.8.24",
  networks: {
    // hardhat: {
    //   forking: {
    //     url: 
    //   }
    // },
    mis385n: {
      url: "http://54.146.235.138:8546/",
      accounts: [process.env.PK],
      chainId: 385000,
      gasPrice: 2e9,
      gas: 30000000
    }
  }
};

// module.exports = {
//   solidity: "0.8.24",
//   networks: {
//     hardhat: {
//       url:zzzz%{api_key} ,
//       accounts: [key]
//     }
//   }
// };

// module.exports = {
//   solidity: {
//     version: "0.8.24",
//     settings: {
//       optimizer: {
//         enabled: true,
//         runs: 1000,
//       },
//     },
//   },
// };