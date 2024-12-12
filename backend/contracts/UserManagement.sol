// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";

contract UserManagement is Ownable {
    using ECDSA for bytes32;

    struct User {
        string name;
        string email;
        string phoneNumber;
        bytes32 passwordHash;
        bool isRegistered;
        bytes32 verificationCode;
    }

    mapping(address => User) public users;
    mapping(string => address) public emailToAddress;

    event UserRegistered(address indexed userAddress, string email);
    event PasswordReset(address indexed userAddress);

    // Pass the deployer address to the Ownable constructor
    constructor() Ownable() {
        transferOwnership(msg.sender);  // explicitly transfer ownership to the deployer
    }

    function registerUser(
        string memory _name,
        string memory _email,
        string memory _phoneNumber,
        bytes32 _passwordHash,
        bytes32 _verificationCode
    ) public {
        require(!users[msg.sender].isRegistered, "User already registered");
        require(emailToAddress[_email] == address(0), "Email already in use");

        users[msg.sender] = User({
            name: _name,
            email: _email,
            phoneNumber: _phoneNumber,
            passwordHash: _passwordHash,
            isRegistered: true,
            verificationCode: _verificationCode
        });

        emailToAddress[_email] = msg.sender;

        emit UserRegistered(msg.sender, _email);
    }

    function login(string memory _email, bytes32 _passwordHash) public view returns (bool) {
        address userAddress = emailToAddress[_email];
        return userAddress != address(0) && 
               users[userAddress].passwordHash == _passwordHash;
    }

    function verifyRegistrationCode(address _user, bytes32 _code) public view returns (bool) {
        return users[_user].verificationCode == _code;
    }

    function resetPassword(
        string memory _email, 
        bytes32 _newPasswordHash
    ) public {
        address userAddress = emailToAddress[_email];
        require(userAddress != address(0), "User not found");
        
        users[userAddress].passwordHash = _newPasswordHash;

        emit PasswordReset(userAddress);
    }

    function getUserDetails(address _user) public view returns (User memory) {
        require(users[_user].isRegistered, "User not registered");
        return users[_user];
    }

    function updateVerificationCode(address _user, bytes32 _newCode) public {
        require(users[_user].isRegistered, "User not registered");
        users[_user].verificationCode = _newCode;
    }
}
