import React, { Component } from 'react';
import contractJson from './contracts/hdwallet.json'
// import { sha256 } from 'js-sha256'
import utils from './utils'
import MissingConfig from './Shared'
import './App.css';

class HDwallet extends Component {
  constructor(props) {
    super(props)
    utils.bindLocalStorage(this)
    utils.buildWeb3(this)
    this.state = { 
      missingConfig: false,    
      msg: '',
      locked: false,
      hdwalletAddress: '',
      hdwalletPrivateKey: '',
      hdwalletIndex: '',
      fetchingHdwalletIndex: false,
      contractDeploying: false,
      contractAddress: '',
      contractFrom: '',
      contractValue: '',
      transactionHash: ''
    }
  }

  componentDidMount = () => {
    if (!this.consortiaId || !this.appCredsUsername || !this.appCredsPassword || 
      !this.nodeRpcEndpoint || !this.hdwalletRpcEndpoint || !this.hdwalletWalletId) {
      this.setState(() => ({
        missingConfig: true
      }))
      return
    }
    this.blockExplorerUrl = this.nodeRpcEndpoint.endsWith('dev.photic.io') ? 'explorer-dev.photic.io' : 'explorer.kaleido.io'
    this.setState(() => ({
      msg: "Sample message"
    }))
  }

  msgChanged = (event) => {
    const val = event.target.value
    this.setState(() => ({
      msg: val
    }));
  };

  lockMsg = () => {
    this.setState(() => ({
      locked: true
    }));
  };

  fetchHdwallet = () => {
    this.setState(() => ({
      hdwalletAddress: '',
      hdwalletPrivateKey: '',
      fetchingHdwalletIndex: true
    }), async () => {
      if (this.hasHdwalletIndex()) {
        let hwa = await this.getHdwalletAccount(this.state.hdwalletIndex)
        this.setState(() => ({
          hdwalletAddress: hwa.address,
          hdwalletPrivateKey: hwa.privateKey,
          fetchingHdwalletIndex: false
        }));
      }
    });
  }

  hasHdwalletIndex = () => {
    return this.state.hdwalletIndex && this.state.hdwalletIndex >= 0
  }

  hdwalletIndexChanged = (event) => {
    const val = event.target.value
    this.setState(() => ({
      hdwalletIndex: val
    }));
  };
  
  deployingContract = () => {
    this.setState(() => ({
      contractDeploying: true
    }), () => this.deployContract());
  }

  deployContract = () => {
    let theContract = utils.getContract(this.web3, contractJson, '', [this.state.msg]);
    let deployObj = theContract.encodeABI();
    let params = {
      gas: 500000000,
      data: deployObj
    };
    this.web3.eth.accounts.signTransaction(params, `0x${this.state.hdwalletPrivateKey}`).then((signed) => {
      this.web3.eth.sendSignedTransaction(signed.rawTransaction)
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
            contractFrom: newInstance.from,
            transactionHash: newInstance.transactionHash
          }));
        });
    });
  }

  getContractValue = () => {
    let theContract = utils.getContract(this.web3, contractJson, this.state.contractAddress, []);
    theContract.methods.get().call().then((value) => {
      console.log('\tSmart contract current state: %j', value);
      this.setState(() => ({
        contractValue: value
      }));
    });
  }

  getHdwalletAccount = (hdwalletAccountIndex) => {
    console.log('fetching hd wallet account to use')
    const headers = new Headers();
    headers.append('Authorization', 'Basic ' + btoa(this.appCredsUsername + ':' + this.appCredsPassword));
    headers.append('content-type', 'application/json')
    headers.append('Accept', 'application/json, text/plain, */*',)
    return fetch(`${this.hdwalletRpcEndpoint}/api/v1/wallets/${this.hdwalletWalletId}/accounts/${hdwalletAccountIndex}`, {
      method: 'GET',
      headers: headers
    }).then(response => response.json())
  }

  render() {
    if (this.state.missingConfig) {
      return (
        <MissingConfig header="HDWallet" headerImage="/imgs/hdwallet.png" />
      )
    }
    return (
      <main className="container">
        <h2 className="pageHeader clearfix">
          <div className="headerImage">
            <img style={{maxWidth: '100%', maxHeight: '100%'}} alt=""
                src={process.env.PUBLIC_URL + '/imgs/hdwallet.png'} />
          </div>
          <div className="headerText">HDWallet</div>
        </h2>
        <h5>
          The purpose of this sample is to show how you can anonymously submit a transaction to the blockchain. We will deploy a 
          simple smart contract which stores and exposes a single value. 
        </h5>
        <br />
        <h6>
          Step 1: Enter a message. This message is the value that will be included in the smart contract when we deploy it in the next step.
        </h6>
        <div>
          <div className="form-group row">
            <label className="col-sm-2 col-form-label">Message</label>
            <div className="col-sm-7">
              <textarea disabled={this.state.locked} onChange={this.msgChanged} 
                        className="form-control"
                        rows="2" value = {this.state.msg} />
            </div>
            { !this.state.locked ?
            <div className="col-sm-3">
              <button disabled={!this.state.msg} 
                      type="button" className="btn btn-primary" onClick={() => this.lockMsg()}>
                Next
              </button>
            </div> : null }
          </div>
          { this.state.locked ? 
            <div>
              <h6>
                Step 2: Let's choose an account generated by your HDWallet to sign the transaction that deploys 
                our contract containing the above message.
              </h6>
              <div className="form-group row">
                <label className="col-sm-2 col-form-label">HDWallet account index</label>
                <div className="col-sm-2">
                  <input type="number" min="0" max="10000" className="form-control col-sm-12" 
                         disabled={this.state.contractDeploying}
                         value={this.state.hdwalletIndex} onChange={this.hdwalletIndexChanged}></input>
                </div>
                { !this.state.contractDeploying ? 
                <div className="col-sm-3">
                  <button disabled={this.state.fetchingHdwalletIndex || !this.hasHdwalletIndex()} type="button" 
                          className="btn btn-primary" onClick={() => this.fetchHdwallet()}>
                    Fetch HDWallet account
                  </button>
                </div> : null }
              </div>
              <div className="form-group row">
                <label className="col-sm-2 col-form-label">HDWallet address</label>
                <div className="col-sm-7">
                  <input type="text" className="form-control col-sm-12" readOnly={true} value={this.state.hdwalletAddress}></input>
                </div>
              </div>
              <div className="form-group row">
                <label className="col-sm-2 col-form-label">HDWallet signing key</label>
                <div className="col-sm-7">
                  <input type="text" className="form-control col-sm-12" readOnly={true} value={this.state.hdwalletPrivateKey}></input>
                </div>
                { !this.state.contractDeploying && this.state.hdwalletAddress && this.state.hdwalletPrivateKey ? 
                <div className="col-sm-3">
                  <button type="button" className="btn btn-success" onClick={() => this.deployingContract()}>
                    Deploy to blockchain!
                  </button>
                </div> : null }
                { this.state.contractDeploying && !this.state.contractAddress ?
                <div className="col-sm-3">
                  <button type="button" disabled={true} className="btn btn-success">
                    Deploying to blockchain...
                  </button>
                </div>
                : null}
              </div>
            </div> : null }
            { this.state.contractAddress ? 
            <div>
              <h6>
                Step 3: Congrats!
                <br />
                The contract has been deployed to the following address: <i>{this.state.contractAddress}</i>.
                <br />
                On the blockchain ledger, this
                <a target='blank' href={`https://${this.blockExplorerUrl}/tx/${this.state.transactionHash}?consortia=${this.consortiaId}&environment=${this.nodeRpcEndpoint.substr(8, 10)}`}> transaction </a> 
                shows that it originated from <i>{this.state.contractFrom}</i>. 
                Notice that this is the account you chose to use from your HDWallet and <b>not</b> your Kaleido node's account address. 
                For future transactions, you can sequentially iterate through the wallet accounts and obtain a different signing key for every transaction.
                For complete anonymity you should never use a signing key more than once. 
              </h6>
              <br />
              <h6>Step 4: Verification - lets query the contract's value</h6>
              <div className="form-group row">
                <label className="col-sm-2 col-form-label">Contract value</label>
                <div className="col-sm-7">
                  <input type="text" className="form-control col-sm-12" readOnly={true} value={this.state.contractValue}></input>
                </div>
                {!this.state.contractValue ?
                <div className="col-sm-3">
                  <button type="button" className="btn btn-primary" 
                          onClick={() => this.getContractValue()}>
                    Get contract value
                  </button>
                </div> : null }
              </div>
              {this.state.contractValue ? 
              <h6>
                Conclusion: Notice that the value stored in the blockchain contract matches your message above.
              </h6> : null }
            </div> : null }
          </div>  
      </main>
    );
  }
}

export default HDwallet;
