pragma solidity ^0.4.17;

contract auditlog {
    struct LogEntry {
        address entityAddress;
        string payload;
    }

    LogEntry[] public logEntries;

    function push(address entityAddress, string payload) public returns(uint rowNumber) {
        LogEntry memory newLogEntry;
        newLogEntry.entityAddress = entityAddress;
        newLogEntry.payload = payload;
        return logEntries.push(newLogEntry)-1;
    }

    function getSize() public view returns(uint size) {
        return logEntries.length;
    }
}