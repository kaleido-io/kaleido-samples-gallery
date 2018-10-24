// NOTE: this contract is here for viewing only. Actual compilation of this contract to generate ipfs.json was 
// done manually and is outside the scope of this example. 

pragma solidity ^0.4.17;

contract ipfs {
   string public Description;
   string public IpfsHash;

   function ipfs(string description, string ipfsHash) public {
      Description = description;
      IpfsHash = ipfsHash;
   }

   function get() public constant returns (string, string) {
      return (Description, IpfsHash);
   }
}
