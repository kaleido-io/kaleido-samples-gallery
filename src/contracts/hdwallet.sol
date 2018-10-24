// NOTE: this contract is here for viewing only. Actual compilation of this contract to generate hdwallet.json was 
// done manually and is outside the scope of this example. 

pragma solidity ^0.4.17;

contract hdwallet {
   string public storedData;

   function hdwallet(string initVal) public {
      storedData = initVal;
   }

   function set(string x) public {
      storedData = x;
   }

   function get() public constant returns (string retVal) {
      return storedData;
   }
}
