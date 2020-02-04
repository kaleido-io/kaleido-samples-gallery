pragma solidity ^0.4.24;

import "./chainlink/contracts/ChainlinkClient.sol";
import "./chainlink/contracts/vendor/Ownable.sol";

contract ChainlinkEthPrice is ChainlinkClient, Ownable {
  uint256 constant private ORACLE_PAYMENT = 0 * LINK;

  struct EthPriceAtBlock
  {
      uint    blockNumber;
      uint    blockTimestamp;
      bytes32 requestId;
      uint256 reportedPrice;
  }

  EthPriceAtBlock[] public ethPrices;
  bytes32 jobId;

  constructor(bytes32 _jobId, address linkTokenAddr, address oracleAddr)
      public
  {
    jobId = _jobId;
    setChainlinkToken(linkTokenAddr);
    setChainlinkOracle(oracleAddr);
  }

  function requestEthereumPrice(string _currency)
    public
    onlyOwner
    returns (bytes32 requestId) {
      Chainlink.Request memory run = buildChainlinkRequest(jobId, this, this.fulfillEthereumPrice.selector);
      run.add("get", "https://min-api.cryptocompare.com/data/price?fsym=ETH&tsyms=USD,EUR,JPY");
      run.add("path", _currency);
      run.addInt("times", 100);
      requestId = sendChainlinkRequest(run, ORACLE_PAYMENT);
  }

  function fulfillEthereumPrice(bytes32 _requestId, uint256 _reportedPrice)
      public
      recordChainlinkFulfillment(_requestId)
  {
      ethPrices.push(EthPriceAtBlock({
          blockNumber: block.number,
          blockTimestamp: block.timestamp,
          requestId: _requestId,
          reportedPrice: _reportedPrice
      }));
      emit RequestEthereumPriceFulfilled(_requestId, _reportedPrice, block.number, block.timestamp);
  }

  event RequestEthereumPriceFulfilled(
      bytes32 indexed requestId,
      uint256 indexed reportedPrice,
      uint256 blockNumber,
      uint256 blockTimestamp
  );

  function getDataCount() public view returns (uint length)
  {
      return ethPrices.length;
  }

  function getData(uint idx) public view returns (uint blockNumber, uint256 reportedPrice)
  {
      return (ethPrices[idx].blockNumber, ethPrices[idx].reportedPrice);
  }
}
