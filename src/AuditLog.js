import React, { Component } from 'react';
import contractJson from './contracts/auditlog.json'
import utils from './utils'
import { Link } from 'react-router-dom';
import { Timeline, TimelineBlip } from 'react-event-timeline'
import JSONPretty from 'react-json-pretty';

class AuditLog extends Component {
  constructor(props) {
    super(props)
    utils.bindLocalStorage(this)
    utils.buildWeb3(this)
    this.state = {     
      missingConfig: false,
      contractDeploying: false,
      contractExistsInLocalStorage: localStorage.getItem('auditLogContractAddress') ? true : false,
      contractAddress: localStorage.getItem('auditLogContractAddress'),
      validMsg: false,
      msg: '',
      addingMsg: false,
      auditRecordCount: 0,
      viewRecordId: 0,
      viewRecordEntityAddress: '',
      viewPrettyJson: '',
      viewJsonMessage: 'click record on left to view transaction details'
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
      contractDeploying: true
    }), () => this.deployContract());
  }

  clearContract = () => {
    localStorage.removeItem('auditLogContractAddress')
    window.location.reload();
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
          contractExistsInLocalStorage: true
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
      if (!accounts || accounts.length === 0) {
        console.error("Can't find accounts in the target node");
      }
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

  renderTimelines() {
    let records = [];
    for (let i = this.state.auditRecordCount - 1; i >= 0; i--) {
      let color = i % 2 === 0 ? "#03a9f4" : "#6fba1c"
      records.push(
        <TimelineBlip
          key={i+1}
          title={`#${i+1}`}
          iconColor={color}
          onClick={() => this.fetchRecord(i)} />)
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

  render() {
    if (this.state.missingConfig) {
      return (
        <main className="container">
          <h2>Audit Log</h2>
          missing&nbsp;
          <Link to="/">
            config
          </Link>
        </main>
      )
    }
    const timelinePanel = {
      overflowY: 'scroll',
      maxHeight: '500px'
    }
    return (
      <main className="container">
        <h2>Audit Log</h2>
        <h5>
          The purpose of this sample is to show how you can use a simple smart contract as an audit log to view records
          as they're submitted over time.
        </h5>
        <br />
        { !this.state.contractExistsInLocalStorage ? 
        <div>
          <h6>
            Step 1: Deploy audit log contract to track log records going forward
          </h6>
          { !this.state.contractDeploying ?
          <div className="col-sm-3">
            <button type="button" className="btn btn-success" 
                    onClick={() => this.deployingContract()}>
              Deploy to blockchain!
            </button>
          </div> : null }
          { this.state.contractDeploying && !this.state.contractAddress ?
          <div className="col-sm-3">
            <button type="button" disabled={true} className="btn btn-success">
              Deploying to blockchain...
            </button>
          </div> : null }
        </div> : null }
        { this.state.contractAddress ? 
        <div>
          <h6>
            The audit log contract has been deployed to the following address: <i>{this.state.contractAddress}</i>.
            If you want to start over with a fresh contract,
            <button className="btn btn-sm btn-link" onClick={() => this.clearContract()}>click here</button>
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
          {this.state.auditRecordCount > 0 ?
          <div>
            <hr />
            <h6>Audit log history (most recent records appear at top)</h6>
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
                      <JSONPretty id="json-pretty" json={this.state.viewPrettyJson} className="form-control-plaintext"></JSONPretty>
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

export default AuditLog;
