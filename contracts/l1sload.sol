// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.0;

contract L2StorageForReputation {
    address constant L1_SLOAD_ADDRESS = 0x0000000000000000000000000000000000000101;
    address immutable l1ContractAddress;

    constructor(address  _l1ContractAddress) {
        l1ContractAddress = _l1ContractAddress;
    }

    function retrieveSlotFromL1(address l1StorageAddress, uint slot) internal view returns (bytes memory) {
        bool success;
        bytes memory returnValue;
        (success, returnValue) = L1_SLOAD_ADDRESS.staticcall(abi.encodePacked(l1StorageAddress, slot));
        if(!success)
        {
            revert("L1SLOAD failed");
        }
        return returnValue;
    }

    // Public functions
    function retrieveL1Balance(address account) public view returns(uint) {
        uint slotNumber = 0;
        return abi.decode(retrieveSlotFromL1(
            l1ContractAddress,
            uint(keccak256(
                abi.encodePacked(uint(uint160(account)),slotNumber)
                )
            )
            ), (uint));
    }
}