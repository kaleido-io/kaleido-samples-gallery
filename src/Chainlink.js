import React, { Component } from 'react';
import sampleJobSpec from './contracts/Chainlink_sample_spec.json'
import contractJson from './contracts/chainlink-ethprice.json'
import contractSolidity from './contracts/chainlink-ethprice.sol'
import utils from './utils'
import { Timeline, TimelineBlip } from 'react-event-timeline'
import MissingConfig from './Shared'
import './App.css';
import JSONPretty from 'react-json-pretty';

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
      showJobSpec: false,
      contractSolidityText: '',
      requestingEthPrice: false,
      contractData: [],
      priceHistoryCount: 0,
      fetchingRecord: false,
      viewJsonMessage: 'click record on left to view price details',
      viewRecordId: 0,
      viewBlockNumber: '',
      viewBlockTimestamp: '',
      viewEthPrice: '',
      jobId: '',
      jobIdSaved: false
    }
  }

  componentDidMount = () => {
    if (!this.appCredsUsername || !this.appCredsPassword || !this.nodeRpcEndpoint ||
        !this.chainlinkApiEndpoint || !this.chainlinkLinkAddr || !this.chainlinkOracleAddr) {
      this.setState(() => ({
        missingConfig: true
      }))
      return
    }

    fetch(contractSolidity).then(resp => resp.text()).then(text => this.setState({
        contractSolidityText: text
    })).catch(err => console.err('Failed to load Solidity source', err));

    if (this.state.contractAddress) {
      this.setPriceHistoryCount()
    }
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

  async deployContract() {
    let chainlinkJobId = this.state.jobId
    if (!chainlinkJobId.startsWith('0x')) chainlinkJobId = '0x' + chainlinkJobId;
    if (!this.chainlinkLinkAddr.startsWith('0x')) this.chainlinkLinkAddr = '0x' + this.chainlinkLinkAddr;
    if (!this.chainlinkOracleAddr.startsWith('0x')) this.chainlinkOracleAddr = '0x' + this.chainlinkOracleAddr;
    let accounts = await this.web3.eth.personal.getAccounts();
    let theContract = utils.getContract(this.web3, contractJson, '', [
      chainlinkJobId, this.chainlinkLinkAddr, this.chainlinkOracleAddr
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
    let wsWeb3 = utils.getNewWeb3(this, true)
    let theContract = utils.getContract(wsWeb3, contractJson, this.state.contractAddress, []);
    let accounts = await wsWeb3.eth.personal.getAccounts();
    let params = {
      from: accounts[0],
      gas: 5000000
    };
    let t = this
    await theContract.methods.requestEthereumPrice("USD").send(params)
    theContract.once('RequestEthereumPriceFulfilled', function(error, event){ 
      if (error) { 
        console.error('RequestEthereumPriceFulfilled failed', error)
        return
      }
      console.log('RequestEthereumPriceFulfilled happened', event); 
      t.setState(() => ({
        requestingEthPrice: false,
        priceHistoryCount: t.state.priceHistoryCount + 1
      }), () => t.fetchRecord(t.state.priceHistoryCount - 1));
    });
  }

  async setPriceHistoryCount() {
    let theContract = utils.getContract(this.web3, contractJson, this.state.contractAddress, []);
    let c = await theContract.methods.getDataCount().call()
    this.setState(() => ({
      priceHistoryCount: Number.parseInt(c)
    }));
  }

  editingContract = () => {
    this.setState(() => ({
      showEditingContract: !this.state.showEditingContract
    }));
  }

  viewingContract = () => {
    this.setState(() => ({
      showContractSource: !this.state.showContractSource,
      showJobSpec: false
    }));
  }

  viewingJobSpec = () => {
    this.setState(() => ({
      showJobSpec: !this.state.showJobSpec,
      showContractSource: false
    }));
  }

  renderTimelines() {
    let records = [], max = 100
    for (let i = this.state.priceHistoryCount - 1; i >= 0 && max > 0; i--, max--) {
      let color = i % 2 === 0 ? "#03CC79" : "#3942C1"
      records.push(
        <div key={i+1} style={{cursor: 'pointer'}} onClick={() => this.fetchRecord(i)}>
          <TimelineBlip title={`#${i+1}`} iconColor={color}/>
        </div>)
    }
    return records;
  }

  fetchRecord = (index) => {
    this.setState(() => ({
      fetchingRecord: true,
      viewJsonMessage: `Fetching record #${index+1}...`
    }), async () => {
      let theContract = utils.getContract(this.web3, contractJson, this.state.contractAddress, []);
      let record = await theContract.methods.ethPrices(index).call()
      this.setState(() => ({
        viewRecordId: index+1,
        viewBlockNumber: record.blockNumber,
        viewBlockTimestamp: new Date(record.blockTimestamp * 1000).toLocaleString(),
        viewEthPrice: record.reportedPrice / 100,
        fetchingRecord: false
      }));
    });
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

  sampleJobId = () => {
    return (
      <pre style={{backgroundColor:'#F3F2F2'}}>
        <JSONPretty style={{marginLeft:'15px'}} id="json-pretty" json={sampleJobSpec} className="form-control-plaintext"></JSONPretty>
      </pre>
    )
  }

  jobIdChanged = (event) => {
    const val = event.target.value
    this.setState(() => ({
      jobId: val
    }));
  }

  saveJobId = () => {
    this.setState(() => ({
      jobIdSaved: true
    }));
  }

  render() {
    if (this.state.missingConfig) {
      return (
        <MissingConfig 
          header="Chainlink"
          headerImage="/imgs/chainlink.png"
          text="you can retrieve the values for CHAINLINK API ENDPOINT, LINK_CONTRACT_ADDRESS & ORACLE_CONTRACT_ADDRESS
          from the Chainlink service dashboard where you launch the Chainlink Web UI"
        />
      )
    }
    const timelinePanel = {
      overflowY: 'scroll',
      maxHeight: '500px',
      borderRight: '1px solid rgba(0,0,0,.1)',
    }
    return (
      <main className="container">
        <h2 className="pageHeader clearfix">
          <div className="headerImage">
            <img style={{maxWidth: '100%', maxHeight: '100%'}} alt=""
                 src={process.env.PUBLIC_URL + '/imgs/chainlink.png'} />
          </div>
          <div className="headerText">Chainlink</div>
        </h2>
        <h5>
          This sample deploys and exercises the following example Chainlink contract,
          which queries the current price of Ether via the Chainlink Oracle
          service and stores the results on your private Kaleido chain.
        </h5>
        <div className="col-sm-12">
          <button className="btn btn-sm btn-link" onClick={() => this.viewingContract()}>view contract source</button>
          <button style={{marginLeft: '25px'}} className="btn btn-sm btn-link" onClick={() => this.viewingJobSpec()}>view sample chainlink job spec</button>
        </div>
        
        { this.state.showContractSource ?
        <pre style={{backgroundColor:'#F3F2F2'}}><code className='solidity'>
            <div style={{marginLeft:'15px'}}>{this.state.contractSolidityText}</div>
        </code></pre>
        : null }
        { this.state.showJobSpec ?
          this.sampleJobId()
        : null }
        <br />
        
        { !this.state.contractExistsInLocalStorage ? 
        <div>
          <h6>
            Step 1: Login to the <a target="_blank" rel="noopener noreferrer" href={this.chainlinkApiEndpoint + '/jobs/new'}>Chainlink dashboard </a> 
            to create a job spec by copying the exact sample chainlink job spec json provided above (or retrieve an already created job spec id). 
            Once created, enter the job spec's JOB ID below as that will be needed for us to deploy the smart contract in the next step
          </h6>
          <div className="form-group row">
            <label className="col-sm-2 col-form-label">Chainlink JOB ID</label>
            <div className="col-sm-5">
              <input type="text" onChange={this.jobIdChanged} disabled={this.state.jobIdSaved}
                     className="form-control"
                     value = {this.state.jobId} />
            </div>
            <div className="col-sm-3">
              <button disabled={!this.state.jobId || this.state.jobIdSaved}
                      type="button" className="btn btn-primary" onClick={() => this.saveJobId()}>
                Next
              </button>
            </div>
          </div>
          {this.state.jobIdSaved ?
          <div>
            <h6>
              Step 2: Deploy a new Chainlink sample contract, or, specify a previously deployed Chainlink sample contract
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
          </div>  : null }
        </div> : null }

        { this.state.contractAddress ? 
        <div>
          <h6>
            The smart contract has been deployed to the following address: 
            <i> {this.state.contractAddress}</i>.
            <br />
            {this.editContractPanel()}
          </h6>
          <br />
          <h6>
            Call a function on the smart contract to ask the Chainlink node to query the current price of ether and return it to us 
            when finished
          </h6>
          <div className="col-sm-3">
            <button type="button" className="btn btn-primary" 
                    disabled={ this.state.requestingEthPrice }
                    onClick={() => this.requestingEthPrice()}>
              { this.state.requestingEthPrice ? "Requesting price of ether via Blockchain..." : "Request price of ether via Blockchain" }
            </button>
          </div>
          <br />
          { this.state.requestingEthPrice ?
          <div className="row col-sm-12">
            <div className="col-sm-1">
              <div className="lds-dual-ring"></div>
            </div>            
            <div className="col-sm-10" style={{marginTop:'9px'}}>
              waiting for Chainlink to fetch the current ETH price
            </div>              
          </div> : null }

          {this.state.priceHistoryCount > 0 ?
          <div>
            <hr />
            <h6>ETH price history (most recently quoted prices appear at top)</h6>
            <br />
            <div className="row col-sm-12">
              <div style={timelinePanel} className="col-sm-3">
                <Timeline>
                  {this.renderTimelines()}
                </Timeline>
              </div>
              <div className="col-sm-8">
                { !this.state.fetchingRecord && this.state.viewRecordId > 0 ?
                <div>
                  <div className="form-group row">
                    <label className="col-sm-3 col-form-label">Record #</label>
                    <div className="col-sm-9">
                      <input type="text" readOnly={true} className="form-control-plaintext" value={this.state.viewRecordId}></input>
                    </div>
                  </div>
                  <div className="form-group row">
                    <label className="col-sm-3 col-form-label">Block timestamp</label>
                    <div className="col-sm-9">
                      <input type="text" readOnly={true} className="form-control-plaintext" value={this.state.viewBlockTimestamp}></input>
                    </div>
                  </div> 
                  <div className="form-group row">
                    <label className="col-sm-3 col-form-label">Quoted ETH price</label>
                    <div className="col-sm-9">
                      <input style={{fontWeight:'bold'}} type="text" readOnly={true} className="form-control-plaintext bold" value={this.state.viewEthPrice}></input>
                    </div>
                  </div>
                  <div className="form-group row">
                    <label className="col-sm-3 col-form-label">Block number</label>
                    <div className="col-sm-9">
                      <input type="text" readOnly={true} className="form-control-plaintext" value={this.state.viewBlockNumber}></input>
                    </div>
                  </div>  
                </div> : 
                <div>
                  { this.state.viewJsonMessage }
                </div> }
              </div>
            </div>
          </div> : null }

        </div> : null }
      </main>
    );
  }
}

export default Chainlink;
