const hre = require("hardhat");

async function main() {
  // Get the contract factories
  const CertificateNFT = await hre.ethers.getContractFactory("CertificateNFT");
  const CertificateVerification = await hre.ethers.getContractFactory("CertificateVerification");

  // Deploy CertificateNFT contract
  const certificateNFT = await CertificateNFT.deploy();
  await certificateNFT.deployed();
  console.log("CertificateNFT Contract deployed to:", certificateNFT.address);

  // Deploy CertificateVerification contract
  const certificateVerification = await CertificateVerification.deploy(certificateNFT.address);
  await certificateVerification.deployed();
  console.log("CertificateVerification Contract deployed to:", certificateVerification.address);

  // Save contract addresses to a JSON file
  const fs = require('fs');
  const contractAddresses = {
    CertificateNFT: certificateNFT.address,
    CertificateVerification: certificateVerification.address
  };

  // Ensure config directory exists
  const configPath = './config';
  if (!fs.existsSync(configPath)){
    fs.mkdirSync(configPath);
  }

  fs.writeFileSync(
    './config/contract-addresses.json', 
    JSON.stringify(contractAddresses, null, 2)
  );
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });