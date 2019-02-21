import React, { Component } from 'react';
import contractJson from './contracts/lighthouse.json'
import utils from './utils'
import MissingConfig from './Shared'
import './App.css';

class Rhombus extends Component {
  constructor(props) {
    super(props)
    utils.bindLocalStorage(this)
    utils.buildWeb3(this)
    this.state = {
      missingConfig: false,
      contractExistsInLocalStorage: localStorage.getItem('lighthouseContractAddress') ? true : false,
      contractAddress: localStorage.getItem('lighthouseContractAddress'),
      editContractAddress: '',
      editContractAddressValid: false,
      modifyingContract: false,
      peekData: null,
      peekUpdated: null,
      refreshingPeekData: true,
      refreshingPeekUpdated: true
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
      this.peekData()
      this.peekUpdated()
    }
  }

  async peekData() {
    let theContract = utils.getContract(this.web3, contractJson, this.state.contractAddress, []);
    let data = await theContract.methods.peekData().call()
    this.setState(() => ({
      peekData: Number.parseInt(data[0]),
      refreshingPeekData: false
    }))
  }

  async peekUpdated() {
    let theContract = utils.getContract(this.web3, contractJson, this.state.contractAddress, []);
    let data = await theContract.methods.peekUpdated().call()
    this.setState(() => ({
      peekUpdated: new Date(data[0] * 1000),
      refreshingPeekUpdated: false
    }))
  }

  refresh = () => {
    this.setState(() => ({
      refreshingPeekData: true,
      refreshingPeekUpdated: true
    }), () => {
      this.peekData()
      this.peekUpdated()
    });
  }

  clearContract = () => {
    this.setState(() => ({
      modifyingContract: true
    }), () => {
      localStorage.removeItem('lighthouseContractAddress')
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
      localStorage.setItem('lighthouseContractAddress', this.state.editContractAddress)
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
        <div className="form-group row">
          <label className="col-sm-2 col-form-label">Rhombus lighthouse address</label>
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
      </div>
    )
  }

  render() {
    if (this.state.missingConfig) {
      return (
        <MissingConfig header="Rhombus" headerImage="/imgs/rhombus.svg" />
      )
    }
    return (
      <main className="container">
        <h2 className="pageHeader clearfix">
          <div className="headerImage">
            <img style={{maxWidth: '100%', maxHeight: '100%'}} alt=""
                src={process.env.PUBLIC_URL + '/imgs/rhombus.svg'} />
          </div>
          <div className="headerText">Rhombus</div>
        </h2>
        <h5>
          The purpose of this sample is to simply view the most recent value that has been pushed by Rhombus to your lighthouse contract.
        </h5>
        <br />
        { !this.state.contractExistsInLocalStorage ? 
        <div>
          <h6>
            Step 1: Specify a previously deployed Rhombus lighthouse contract address
          </h6>
          {this.editContractPanel()}
        </div> : null }
        { this.state.contractAddress ? 
        <div>
          <h6>
            The Rhombus lighthouse contract has been deployed to the following address: 
            <i> {this.state.contractAddress}</i>.
            <br />To change the address, enter a new one below and click load contract.
            <br /><br />
            {this.editContractPanel()}
          </h6>
          <br />
          <hr />
          <div className="row">
            <h6 className="col-sm-5">View stored lighthouse contract values</h6>
            <button disabled={this.state.refreshingPeekData || this.state.refreshingPeekUpdated}
                    type="button" className="btn btn-sm btn-secondary" onClick={() => this.refresh()}>
              {this.state.refreshingPeekData || this.state.refreshingPeekUpdated ? "Refreshing data..." : "Refresh data"}
            </button>
          </div>
          <br />
          <div className="form-group row">
            <label className="col-sm-2 col-form-label">Value</label>
            <div className="col-sm-8">
              {this.state.refreshingPeekData ? <span>Loading...</span> : 
              <input type="text" readOnly={true} className="form-control-plaintext" value={this.state.peekData}></input>}
            </div>
          </div>
          <div className="form-group row">
            <label className="col-sm-2 col-form-label">Last updated</label>
            <div className="col-sm-8">
              {this.state.refreshingPeekUpdated ? <span>Loading...</span> : 
              <input type="text" readOnly={true} className="form-control-plaintext" value={this.state.peekUpdated}></input>}
            </div>
          </div>
        </div> : null }
      </main>
    );
  }
}

export default Rhombus;
