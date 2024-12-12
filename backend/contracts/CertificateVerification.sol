// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./OrganizationNFT.sol";

contract CertificateVerification is Ownable {
    struct Certificate {
        string studentName;
        string courseName;
        string issuerName;
        uint256 issueDate;
        string additionalDetails;
        address owner;
        bool isValid;
    }

    OrganizationNFT public organizationNFT;
    mapping(bytes32 => Certificate) public certificates;
    mapping(address => bytes32[]) public userCertificates;

    event CertificateIssued(bytes32 certificateHash, address indexed owner);
    event CertificateVerified(bytes32 certificateHash, bool isValid);

    constructor(address _organizationNFTAddress) {
        organizationNFT = OrganizationNFT(_organizationNFTAddress);
    }

    function issueCertificate(
        string memory _studentName,
        string memory _courseName,
        string memory _issuerName,
        uint256 _issueDate,
        string memory _additionalDetails
    ) public {
        require(organizationNFT.isOrganizationAuthorized(msg.sender), "Unauthorized organization");

        bytes32 certificateHash = keccak256(abi.encodePacked(
            _studentName, 
            _courseName, 
            _issuerName, 
            _issueDate
        ));

        certificates[certificateHash] = Certificate({
            studentName: _studentName,
            courseName: _courseName,
            issuerName: _issuerName,
            issueDate: _issueDate,
            additionalDetails: _additionalDetails,
            owner: msg.sender,
            isValid: true
        });

        userCertificates[msg.sender].push(certificateHash);
        emit CertificateIssued(certificateHash, msg.sender);
    }

    function verifyCertificate(
        string memory _studentName,
        string memory _courseName,
        string memory _issuerName,
        uint256 _issueDate
    ) public view returns (bool) {
        bytes32 certificateHash = keccak256(abi.encodePacked(
            _studentName, 
            _courseName, 
            _issuerName, 
            _issueDate
        ));

        Certificate memory cert = certificates[certificateHash];
        return cert.isValid && 
               keccak256(abi.encodePacked(cert.studentName)) == keccak256(abi.encodePacked(_studentName)) &&
               keccak256(abi.encodePacked(cert.courseName)) == keccak256(abi.encodePacked(_courseName)) &&
               keccak256(abi.encodePacked(cert.issuerName)) == keccak256(abi.encodePacked(_issuerName));
    }

    function getUserCertificates(address _user) public view returns (bytes32[] memory) {
        return userCertificates[_user];
    }

    function getCertificateDetails(bytes32 _certificateHash) public view returns (Certificate memory) {
        return certificates[_certificateHash];
    }

    function invalidateCertificate(bytes32 _certificateHash) public {
        require(certificates[_certificateHash].owner == msg.sender, "Only certificate owner can invalidate");
        certificates[_certificateHash].isValid = false;
    }
}