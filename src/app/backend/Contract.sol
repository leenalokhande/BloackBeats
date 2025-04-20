// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract MusicLicense {

    enum LicenseType { Streaming, Distribution, Commercial, Remix, Exclusive }

    struct License {
        address creator;
        address licensee;
        LicenseType licenseType;
        uint256 startTimestamp;
        uint256 endTimestamp;
        string ipfsHash; // Points to music metadata or file on IPFS
        bool isActive;
    }

    uint256 public licenseCounter;
    mapping(uint256 => License) public licenses;

    event LicenseIssued(
        uint256 indexed licenseId,
        address indexed creator,
        address indexed licensee,
        LicenseType licenseType,
        uint256 startTimestamp,
        uint256 endTimestamp,
        string ipfsHash
    );

    /// @notice Creates a new music license
    function issueLicense(
        address _licensee,
        LicenseType _licenseType,
        uint256 _durationInDays,
        string calldata _ipfsHash
    ) external {
        require(_licensee != address(0), "Invalid licensee address");
        require(_durationInDays > 0, "Duration must be greater than 0");
        require(bytes(_ipfsHash).length > 0, "IPFS hash is required");

        uint256 start = block.timestamp;
        uint256 end = start + (_durationInDays * 1 days);

        licenseCounter++;
        licenses[licenseCounter] = License({
            creator: msg.sender,
            licensee: _licensee,
            licenseType: _licenseType,
            startTimestamp: start,
            endTimestamp: end,
            ipfsHash: _ipfsHash,
            isActive: true
        });

        emit LicenseIssued(
            licenseCounter,
            msg.sender,
            _licensee,
            _licenseType,
            start,
            end,
            _ipfsHash
        );
    }

    /// @notice Checks if a license is active
    function isLicenseActive(uint256 _licenseId) public view returns (bool) {
        License memory lic = licenses[_licenseId];
        return lic.isActive && block.timestamp >= lic.startTimestamp && block.timestamp <= lic.endTimestamp;
    }

    /// @notice Manually deactivate a license (creator only)
    function deactivateLicense(uint256 _licenseId) external {
        License storage lic = licenses[_licenseId];
        require(msg.sender == lic.creator, "Only creator can deactivate");
        lic.isActive = false;
    }

    /// @notice Returns IPFS hash for a license
    function getIpfsHash(uint256 _licenseId) external view returns (string memory) {
        return licenses[_licenseId].ipfsHash;
    }
}
