import React, { Component } from 'react';
import contractJson from './contracts/chainlink-ethprice.json'
import contractSolidity from './contracts/chainlink-ethprice.sol'
import utils from './utils'
import MissingConfig from './Shared'
 
class Chainlink extends Component {
  constructor(props) {
    super(props)
    utils.bindLocalStorage(this)
    utils.buildWeb3(this)
    this.state = {
      missingConfig: false,
      contractExistsInLocalStorage: localStorage.getItem('chainlinkContractAddress') ? true : false,
      contractAddress: localStorage.getItem('chainlinkContractAddress'),
      showEditingContract: false,
      editContractAddress: '',
      editContractAddressValid: false,
      modifyingContract: false,
      showContractSource: false,
      contractSolidityText: '',
      requestingEthPrice: false,
      requestingData: false,
      contractData: []
    }
  }

  componentDidMount = () => {
    if (!this.appCredsUsername || !this.appCredsPassword || !this.nodeRpcEndpoint ||
        !this.chainlinkLinkAddr || !this.chainlinkOracleAddr || !this.chainlinkJobID) {
      this.setState(() => ({
        missingConfig: true
      }))
      return
    }
    fetch(contractSolidity).then(resp => resp.text()).then(text => this.setState({
        contractSolidityText: text
    })).catch(err => console.err('Failed to load Solidity source', err));
  }

  deployingContract = () => {
    this.setState(() => ({
      modifyingContract: true
    }), () => this.deployContract());
  }

  requestingEthPrice = () => {
    this.setState(() => ({
        requestingEthPrice: true
    }), () => this.requestEthPrice());
  }

  requestingData = () => {
    this.setState(() => ({
        requestingData: true
    }), () => this.requestData());
  }

  async deployContract() {
    if (!this.chainlinkJobID.startsWith('0x')) this.chainlinkJobID = '0x' + this.chainlinkJobID;
    if (!this.chainlinkLinkAddr.startsWith('0x')) this.chainlinkLinkAddr = '0x' + this.chainlinkLinkAddr;
    if (!this.chainlinkOracleAddr.startsWith('0x')) this.chainlinkOracleAddr = '0x' + this.chainlinkOracleAddr;
    let accounts = await this.web3.eth.personal.getAccounts();
    let theContract = utils.getContract(this.web3, contractJson, '', [
        this.chainlinkJobID, this.chainlinkLinkAddr, this.chainlinkOracleAddr
    ])
    let deployObj = theContract.encodeABI();
    let params = {
      from: accounts[0],
      gas: 500000000,
      data: deployObj
    };
    this.web3.eth.sendTransaction(params)
      .on('receipt', (receipt) => {
        console.log(receipt);
      })
      .on('error', (err) => {
        console.error('Failed to deploy the smart contract. Error: ' + err);
      })
      .then((newInstance) => {
        console.log(newInstance)
        console.log(`\tSmart contract deployed, ready to take calls at '${newInstance.contractAddress}'`);
        this.setState(() => ({
          contractAddress: newInstance.contractAddress,
          contractExistsInLocalStorage: true,
          modifyingContract: false
        }), () => localStorage.setItem('chainlinkContractAddress', newInstance.contractAddress));
      });
  }

  async requestEthPrice() {
    let theContract = utils.getContract(this.web3, contractJson, this.state.contractAddress, []);
    let accounts = await this.web3.eth.personal.getAccounts();
    let params = {
      from: accounts[0],
      gas: 5000000
    };
    await theContract.methods.requestEthereumPrice("USD").send(params)
    this.setState(() => ({
        requestingEthPrice: false
    }));

  }

  async requestData() {
    let theContract = utils.getContract(this.web3, contractJson, this.state.contractAddress, []);
    let dataCount = await theContract.methods.getDataCount().call()
    console.log('Data count', dataCount);
    let data = [];
    for (let i = 0; i < dataCount; i++) {
        data.push(await theContract.methods.getData(i).call());
    }
    this.setState(() => ({
        contractData: data,
        requestingData: false
    }));

  }

  editingContract = () => {
    this.setState(() => ({
      showEditingContract: !this.state.showEditingContract
    }));
  }

  viewingContract = () => {
    this.setState(() => ({
      showContractSource: !this.state.showContractSource
    }));
  }

  clearContract = () => {
    this.setState(() => ({
      modifyingContract: true
    }), () => {
      localStorage.removeItem('chainlinkContractAddress')
      window.location.reload()
    });
  }

  changeContractAddress = () => {
    this.setState(() => ({
      modifyingContract: true
    }), () => {
      let theContract = utils.getContract(this.web3, contractJson, this.state.editContractAddress, []);
      if (!theContract) {
        alert("invalid contract address")
        this.setState(() => ({
          modifyingContract: false
        }))
      }
      localStorage.setItem('chainlinkContractAddress', this.state.editContractAddress)
      window.location.reload()
    });
  }

  editContractAddressChanged = (event) => {
    const val = event.target.value
    this.setState(() => ({
      editContractAddress: val,
      editContractAddressValid: val.startsWith('0x') && val.length === 42
    }));
  };

  editContractPanel = () => {
    return (
      <div>        
        <div className="col-sm-12">
          <button className="btn btn-sm btn-link" onClick={() => this.editingContract()}>load a previously deployed contract</button>
        </div>
        { this.state.showEditingContract ?
        <div>
          <small className="col-sm-12">
            load a previously deployed contract, or, clear the above loaded contract from local storage so you can start over and deploy a brand new one
          </small>
          <div className="form-group row">
            <label className="col-sm-2 col-form-label">Chainlink contract address</label>
            <div className="col-sm-5">
              <input disabled={this.state.modifyingContract} type="text" className="form-control" onChange={this.editContractAddressChanged} />
            </div>
            <div className="col-sm-5">
              <button disabled={!this.state.editContractAddressValid || this.state.modifyingContract} type="button" className="btn btn-sm btn-primary" 
                      onClick={() => this.changeContractAddress()}>
                load contract
              </button>
              { this.state.contractExistsInLocalStorage ? <small style={{marginLeft: '15px'}}>or</small> : null }
              { this.state.contractExistsInLocalStorage ? 
                <button style={{marginLeft: '15px'}} type="button" className="btn btn-sm btn-warning" disabled={this.state.modifyingContract}
                        onClick={() => this.clearContract()}>
                  clear current contract
                </button> : null }
            </div>
          </div>
        </div>  : null }
      </div>
    )
  }

  render() {
    if (this.state.missingConfig) {
      return (
        <MissingConfig header="Chainlink" />
      )
    }
    const timelinePanel = {
      overflowY: 'scroll',
      maxHeight: '500px',
      borderRight: '1px solid rgba(0,0,0,.1)',
    }
    return (
      <main className="container">
        <h2>Chainlink</h2>
        <h5>
          This deploys and exercises the following example Chainlink contract,
          which queries the current price of Ether via the Chainlink Oracle
          service and stores the results on your private Kaleido chain.
        </h5>
        <div className="col-sm-12">
          <button className="btn btn-sm btn-link" onClick={() => this.viewingContract()}>view contract source</button>
        </div>
        { this.state.showContractSource ?
        <pre><code className='solidity'>
            {this.state.contractSolidityText}
        </code></pre>
        : null }
        <br />
        { !this.state.contractExistsInLocalStorage ? 
        <div>
          <h6>
            Step 1: Deploy the example contract, or use an existing contract
          </h6>
          <div className="col-sm-3">
            <button type="button" className="btn btn-success" 
                    disabled={ this.state.modifyingContract }
                    onClick={() => this.deployingContract()}>
              { this.state.modifyingContract ? "Deploying to blockchain..." : "Deploy to blockchain!" }
            </button>
          </div>
          <small>or</small>
          {this.editContractPanel()}
        </div> : null }
        { this.state.contractAddress ? 
        <div>
          <h6>
            The audit log smart contract has been deployed to the following address: 
            <i> {this.state.contractAddress}</i>.
            <br />
            {this.editContractPanel()}
          </h6>
          <br />
          <div className="col-sm-3">
            <button type="button" className="btn btn-success" 
                    disabled={ this.state.requestingEthPrice }
                    onClick={() => this.requestingEthPrice()}>
              { this.state.sendingTxn ? "Sending transaction..." : "Request price of ether via Blockchain" }
            </button>
          </div>
          <br />
          <div className="col-sm-3">
            <button type="button" className="btn btn-success" 
                    disabled={ this.state.requestingData }
                    onClick={() => this.requestingData()}>
              { this.state.callingContract ? "Querying..." : "Get Chainlinked results from contract" }
            </button>
          </div>
          {
              this.state.contractData.map(entry => (
                <div className="col-sm-3" key={entry.blockNumber}>
                    <p>Reported price: {entry.reportedPrice} (Block number: {entry.blockNumber})</p>
                </div>
              ))
          }

        </div> : null }
      </main>
    );
  }
}

export default Chainlink;
