const Web3 = require('web3');
const ContractABI = require('../contracts/CertificateVerification.json');
const NFTContractABI = require('../contracts/CertificateNFT.json');

class BlockchainService {
  constructor() {
    // Initialize Web3 with Infura endpoint
    this.web3 = new Web3(new Web3.providers.HttpProvider(
      process.env.BLOCKCHAIN_NETWORK_URL
    ));

    // Create account from private key
    const account = this.web3.eth.accounts.privateKeyToAccount(
      process.env.BLOCKCHAIN_PRIVATE_KEY
    );
    this.web3.eth.accounts.wallet.add(account);
    this.web3.eth.defaultAccount = account.address;

    // Initialize contract instances
    this.certificateContract = new this.web3.eth.Contract(
      ContractABI.abi, 
      process.env.CERTIFICATE_CONTRACT_ADDRESS
    );

    this.nftContract = new this.web3.eth.Contract(
      NFTContractABI.abi, 
      process.env.NFT_CONTRACT_ADDRESS
    );
  }

  async registerCertificate(certificateData) {
    try {
      const transaction = await this.certificateContract.methods.registerCertificate(
        certificateData.studentId,
        certificateData.institutionId,
        certificateData.certificateTitle,
        certificateData.ipfsHash
      ).send({
        from: this.web3.eth.defaultAccount,
        gas: 300000
      });

      return {
        transactionHash: transaction.transactionHash,
        blockNumber: transaction.blockNumber
      };
    } catch (error) {
      console.error('Blockchain Certificate Registration Error:', error);
      throw new Error('Failed to register certificate on blockchain');
    }
  }

  async verifyCertificate(transactionHash) {
    try {
      // Retrieve transaction details
      const transaction = await this.web3.eth.getTransaction(transactionHash);
      
      if (!transaction) {
        return false;
      }

      // Decode transaction input to verify certificate details
      const decodedInput = this.certificateContract.methods.registerCertificate().decodeInput(
        transaction.input
      );

      // Additional verification logic can be added here
      return true;
    } catch (error) {
      console.error('Blockchain Certificate Verification Error:', error);
      return false;
    }
  }

  async mintInstitutionNFT(institutionData) {
    try {
      const transaction = await this.nftContract.methods.mintInstitutionNFT(
        institutionData.name,
        institutionData.registrationNumber
      ).send({
        from: this.web3.eth.defaultAccount,
        gas: 300000
      });

      return transaction.events.Transfer.returnValues.tokenId;
    } catch (error) {
      console.error('Institution NFT Minting Error:', error);
      throw new Error('Failed to mint institution NFT');
    }
  }

  async validateInstitutionNFT(tokenId) {
    try {
      const isValid = await this.nftContract.methods.isValidInstitution(tokenId).call();
      return isValid;
    } catch (error) {
      console.error('Institution NFT Validation Error:', error);
      return false;
    }
  }
}

module.exports = new BlockchainService();