// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";  // Make sure the Counters.sol import is correct

contract OrganizationNFT is ERC721, Ownable {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;  // Ensure _tokenIds is declared correctly

    struct OrganizationDetails {
        string name;
        string registrationNumber;
        string email;
        string country;
        bool isVerified;
    }

    mapping(uint256 => OrganizationDetails) public organizationDetails;
    mapping(address => bool) public authorizedOrganizations;

    event OrganizationRegistered(uint256 tokenId, address organizationAddress);

    constructor() ERC721("Academic Organization", "AO") {}

    function registerOrganization(
        string memory _name,
        string memory _registrationNumber,
        string memory _email,
        string memory _country
    ) public returns (uint256) {
        require(bytes(_name).length > 0, "Name cannot be empty");
        require(bytes(_registrationNumber).length > 0, "Registration number cannot be empty");

        _tokenIds.increment();  // Increment the token ID counter
        uint256 newTokenId = _tokenIds.current();  // Get the new token ID

        _safeMint(msg.sender, newTokenId);  // Mint the new NFT with the new token ID

        organizationDetails[newTokenId] = OrganizationDetails({
            name: _name,
            registrationNumber: _registrationNumber,
            email: _email,
            country: _country,
            isVerified: false
        });

        emit OrganizationRegistered(newTokenId, msg.sender);
        return newTokenId;
    }

    function verifyOrganization(uint256 _tokenId) public onlyOwner {
        require(_exists(_tokenId), "Organization does not exist");
        organizationDetails[_tokenId].isVerified = true;
        authorizedOrganizations[ownerOf(_tokenId)] = true;
    }

    function revokeOrganization(uint256 _tokenId) public onlyOwner {
        require(_exists(_tokenId), "Organization does not exist");
        organizationDetails[_tokenId].isVerified = false;
        authorizedOrganizations[ownerOf(_tokenId)] = false;
    }

    function getOrganizationDetails(uint256 _tokenId) public view returns (OrganizationDetails memory) {
        require(_exists(_tokenId), "Organization does not exist");
        return organizationDetails[_tokenId];
    }

    function isOrganizationAuthorized(address _organization) public view returns (bool) {
        return authorizedOrganizations[_organization];
    }
}
