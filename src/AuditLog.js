import React, { Component } from 'react';
import contractJson from './contracts/auditlog.json'
import utils from './utils'
import { Timeline, TimelineBlip } from 'react-event-timeline'
import JSONPretty from 'react-json-pretty';
import MissingConfig from './Shared'
import './App.css';

class AuditLog extends Component {
  constructor(props) {
    super(props)
    utils.bindLocalStorage(this)
    utils.buildWeb3(this)
    this.state = {
      missingConfig: false,
      contractExistsInLocalStorage: localStorage.getItem('auditLogContractAddress') ? true : false,
      contractAddress: localStorage.getItem('auditLogContractAddress'),
      validMsg: false,
      msg: '',
      addingMsg: false,
      auditRecordCount: 0,
      viewRecordId: 0,
      viewRecordEntityAddress: '',
      viewPrettyJson: '',
      viewJsonMessage: 'click record on left to view transaction details',
      showEditingContract: false,
      editContractAddress: '',
      editContractAddressValid: false,
      modifyingContract: false
    }
  }

  componentDidMount = () => {
    if (!this.appCredsUsername || !this.appCredsPassword || !this.nodeRpcEndpoint) {
      this.setState(() => ({
        missingConfig: true
      }))
      return
    }
    if (this.state.contractAddress) {
      this.getNumberOfRecords()
    }
  }

  deployingContract = () => {
    this.setState(() => ({
      modifyingContract: true
    }), () => this.deployContract());
  }

  async getNumberOfRecords() {
    let theContract = utils.getContract(this.web3, contractJson, this.state.contractAddress, []);
    let records = await theContract.methods.getSize().call()
    this.setState(() => ({
      auditRecordCount: Number.parseInt(records)
    }))
  }

  async deployContract() {
    let accounts = await this.web3.eth.personal.getAccounts();
    let theContract = utils.getContract(this.web3, contractJson, '', [])
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
        }), () => localStorage.setItem('auditLogContractAddress', newInstance.contractAddress));
      });
  }

  msgChanged = (event) => {
    const val = event.target.value
    this.setState(() => ({
      msg: val,
      validMsg: this.isJSON(val)
    }));
  };

  isJSON = (str) => {
    if( typeof( str ) !== 'string' ) { 
      return false;
    }
    try {
      JSON.parse(str);
      return true;
    } catch (e) {
      return false;
    }
  }

  addMsg = () => {
    this.setState(() => ({
      addingMsg: true
    }), async () => {
      let theContract = utils.getContract(this.web3, contractJson, this.state.contractAddress, [])
      let accounts = await this.web3.eth.personal.getAccounts();
      let params = {
        from: accounts[0],
        gas: 5000000
      };
      await theContract.methods.push(accounts[0], this.state.msg).send(params)
        .on('error', (err) => {
          console.error('Failed to call the smart contract. Error: ' + err);
        })
        .then((resp) => {
          console.log(resp)
          this.setState(() => ({
            msg: '',
            addingMsg: false,
            validMsg: false,
            auditRecordCount: this.state.auditRecordCount + 1
          }), () => this.fetchRecord(this.state.auditRecordCount - 1));
        });
    });
  };

  refresh = () => {
    this.setState(() => ({
      refreshing: true
    }), window.location.reload());
  }

  renderTimelines() {
    let records = [], max = 100
    for (let i = this.state.auditRecordCount - 1; i >= 0 && max > 0; i--, max--) {
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
      let record = await theContract.methods.logEntries(index).call()
      this.setState(() => ({
        viewRecordId: index+1,
        viewPrettyJson: record.payload,
        viewRecordEntityAddress: record.entityAddress,
        fetchingRecord: false
      }));
    });
  }

  editingContract = () => {
    this.setState(() => ({
      showEditingContract: !this.state.showEditingContract
    }));
  }

  clearContract = () => {
    this.setState(() => ({
      modifyingContract: true
    }), () => {
      localStorage.removeItem('auditLogContractAddress')
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
      localStorage.setItem('auditLogContractAddress', this.state.editContractAddress)
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
            <label className="col-sm-2 col-form-label">Audit log contract address</label>
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
        <MissingConfig header="Audit Log" headerImage="/imgs/blockexplorer.png" />
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
                src={process.env.PUBLIC_URL + '/imgs/blockexplorer.png'} />
          </div>
          <div className="headerText">Audit Log</div>
        </h2>
        <h5>
          The purpose of this sample is to show how you can use a simple smart contract as an audit log to view records
          as they're submitted over time.
        </h5>
        <br />
        { !this.state.contractExistsInLocalStorage ? 
        <div>
          <h6>
            Step 1: Deploy a new audit log contract to track log records going forward, or, specify a previously deployed audit log contract
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
          <h6>Add new log record by calling a function on the smart contract</h6>
          <div className="form-group row">
            <label className="col-sm-2 col-form-label">JSON payload</label>
            <div className="col-sm-7">
              <textarea disabled={this.state.addingMsg} onChange={this.msgChanged} 
                        className="form-control"
                        rows="3" value = {this.state.msg} />
            </div>
            <div className="col-sm-3">
              <button disabled={this.state.addingMsg || !this.state.validMsg} 
                      type="button" className="btn btn-primary" onClick={() => this.addMsg()}>
                {this.state.addingMsg ? "Adding..." : "Add"}
              </button>
              {this.state.msg && !this.state.validMsg ? " invalid json " : ""}
            </div>
          </div>
          
          <div>
            <hr />
            <div className="row">
              <h6 className="col-sm-5">Audit log history (most recent records appear at top)</h6>
              <button disabled={this.state.refreshing || this.state.addingMsg}
                      type="button" className="btn btn-sm btn-secondary" onClick={() => this.refresh()}>
                {this.state.refreshing ? "Refreshing history..." : "Refresh history"}
              </button>
            </div>
            
            {this.state.auditRecordCount > 0 ?
            <div>
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
                      <label className="col-sm-2 col-form-label">Record #</label>
                      <div className="col-sm-10">
                        <input type="text" readOnly={true} className="form-control-plaintext" value={this.state.viewRecordId}></input>
                      </div>
                    </div>
                    <div className="form-group row">
                      <label className="col-sm-2 col-form-label">Entity address</label>
                      <div className="col-sm-10">
                        <input type="text" readOnly={true} className="form-control-plaintext" value={this.state.viewRecordEntityAddress}></input>
                      </div>
                    </div>
                    <div className="form-group row">
                      <label className="col-sm-2 col-form-label">Payload</label>
                      <div className="col-sm-10">
                        <pre style={{backgroundColor:'#F3F2F2'}}>
                          <JSONPretty style={{marginLeft:'15px'}} id="json-pretty" json={this.state.viewPrettyJson} className="form-control-plaintext"></JSONPretty>
                        </pre>
                      </div>
                    </div> 
                  </div> : 
                  <div>
                    { this.state.viewJsonMessage }
                  </div> }
                </div>
              </div>
            </div> : null }
          </div>
        </div> : null }
      </main>
    );
  }
}

export default AuditLog;
