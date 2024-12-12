const { create } = require('ipfs-http-client');
require('dotenv').config();

const ipfsClient = create({
  host: 'ipfs.infura.io',
  port: 5001,
  protocol: 'https',
  headers: {
    authorization: process.env.IPFS_PROJECT_ID 
      ? `Basic ${Buffer.from(`${process.env.IPFS_PROJECT_ID}:${process.env.IPFS_PROJECT_SECRET}`).toString('base64')}`
      : ''
  }
});

const uploadToIPFS = async (fileBuffer) => {
  try {
    const result = await ipfsClient.add(fileBuffer);
    return result.path;
  } catch (error) {
    console.error('IPFS upload error:', error);
    throw error;
  }
};

module.exports = { 
  ipfsClient, 
  uploadToIPFS 
};