import React, { Component } from 'react';
import contractJson from './contracts/ipfs.json'
import utils from './utils'
import MissingConfig from './Shared'
import './App.css';

class IPFS extends Component {
  constructor(props) {
    super(props)
    utils.bindLocalStorage(this)
    utils.buildWeb3(this)
    this.state = {     
      missingConfig: false,
      selectedFile: null,
      uploadingFile: false,
      uploadedFile: false,
      ipfsHash: '',
      ipfsLink: '',
      fileDescription: '',
      contractDeploying: false,
      contractAddress: '',
      contractFileDescription: '',
      contractIpfsHash: ''
    }
  }

  componentDidMount = () => {
    if (!this.appCredsUsername || !this.appCredsPassword || !this.nodeRpcEndpoint || !this.ipfsRpcEndpoint) {
      this.setState(() => ({
        missingConfig: true
      }))
    }
  }

  fileChangedHandler = (event) => {
    const file = event.target.files[0]
    if (!file) {
      this.setState(() => ({
        selectedFile: null
      }))
    } else {
      this.setState(() => ({
        selectedFile: file
      }))  
    }
  }

  uploadToIpfs = () => {
    this.setState(() => ({
      uploadingFile: true
    }), () => {
      const headers = new Headers();
      headers.append('Authorization', 'Basic ' + btoa(this.appCredsUsername + ':' + this.appCredsPassword));
      headers.append('Accept', 'application/json, text/plain, */*',)  
      const formData = new FormData()
      formData.append('blob', this.state.selectedFile)
      fetch(`${this.ipfsRpcEndpoint}/v0/add`, {
        method: 'POST',
        headers: headers,
        body: formData
      })
      .then(r => r.json())
      .then(data => {
        console.log(data)
        let ipfsLink = utils.buildServiceUrlWithCreds(this, `${this.ipfsRpcEndpoint}/v0`)
        this.setState(() => ({
          ipfsHash: data.Hash,
          ipfsLink: `${ipfsLink}/cat/${data.Hash}`,
          uploadedFile: true,
          uploadingFile: false
        })) 
      })
    }) 
  }

  fileDescriptionChanged = (event) => {
    const val = event.target.value
    this.setState(() => ({
      fileDescription: val
    })) 
  }

  deployingContract = () => {
    this.setState(() => ({
      contractDeploying: true
    }), () => this.deployContract());
  }

  async deployContract() {
    let accounts = await this.web3.eth.personal.getAccounts();
    let theContract = utils.getContract(this.web3, contractJson, '', [this.state.fileDescription, this.state.ipfsHash])
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
          contractAddress: newInstance.contractAddress
        }));
      });
  }

  getContractValues = () => {
    let theContract = utils.getContract(this.web3, contractJson, this.state.contractAddress, []);
    theContract.methods.get().call().then((data) => {
      console.log('\tSmart contract current state: %j', data);
      this.setState(() => ({
        contractFileDescription: data['0'],
        contractIpfsHash: data['1']
      }));
    });
  }

  downloadFile = () => {
    var headers = new Headers();
    headers.append('Authorization', 'Basic ' + btoa(this.appCredsUsername + ':' + this.appCredsPassword));
    headers.append('Accept', 'application/json, text/plain, */*',)
    let url = `${this.ipfsRpcEndpoint}/v0/get/${this.state.ipfsHash}`
    fetch(url, {
      method: 'GET',
      headers: headers
    })
  }

  render() {
    if (this.state.missingConfig) {
      return (
        <MissingConfig header="IPFS" />
      )
    }
    return (
      <main className="container">
        <h2 className="pageHeader clearfix">
          <div className="headerImage">
            <img style={{maxWidth: '100%', maxHeight: '100%'}} 
                src={process.env.PUBLIC_URL + '/imgs/ipfs.png'} />
          </div>
          <div className="headerText">IPFS</div>
        </h2>
        <h5>
          The purpose of this sample is to show how you can add a file to IPFS, and then store a 
          description of the file along with the IPFS content hash in a blockchain smart contract. 
          This is a popular pattern for storing large amounts of data off-chain (in IPFS) and storing the 
          reference (IPFS content hash) of where the data is located on-chain.
        </h5>
        <br />
        <h6>
          Step 1: Add a file to IPFS and retrieve the IPFS hash back once it's been added.
        </h6>
        <div className="form-group row">
          <label className="col-sm-2 col-form-label">Upload a file</label>
          <div className="col-sm-5">
            <input disabled={this.state.uploadedFile} type="file" 
                   onChange={this.fileChangedHandler}
                   ref={this.fileRef} />
          </div>
          { !this.state.uploadedFile ?
          <div className="col-sm-5">
            <button disabled={!this.state.selectedFile || this.state.uploadingFile} type="button" className="btn btn-primary" 
                    onClick={() => this.uploadToIpfs()}>
              Upload file
            </button>
          </div> : null }
        </div>

        { this.state.uploadedFile ? 
        <div>
          <h6>
            Step 2: The file has been added to IPFS with the following content hash: <i>{this.state.ipfsHash}</i>.
            <br /> Enter a friendly file description for this file and then we can deploy the smart contract containing
            the description and IPFS content hash.
          </h6>
          <div className="form-group row">
            <label className="col-sm-2 col-form-label">File description</label>
            <div className="col-sm-7">
              <input type="text" className="form-control col-sm-12" readOnly={this.state.contractDeploying}
                     onChange={this.fileDescriptionChanged} value={this.state.fileDescription} />
            </div>
            { !this.state.contractDeploying ? 
            <div className="col-sm-3">
              <button disabled={!this.state.fileDescription} type="button" className="btn btn-success" 
                      onClick={() => this.deployingContract()}>
                Deploy to blockchain!
              </button>
            </div> : null }
            { this.state.contractDeploying && !this.state.contractAddress ?
            <div className="col-sm-3">
              <button type="button" disabled={true} className="btn btn-success">
                Deploying to blockchain...
              </button>
            </div>
            : null }
          </div>
        </div> : null }

        { this.state.contractAddress ? 
        <div>
          <h6>
            Step 3: Congrats!
            <br />
            The contract has been deployed to the following address: <i>{this.state.contractAddress}</i>.
          </h6>
          <br />
          <h6>Step 4: Verification - lets query the contract's values</h6>
          <div className="form-group row">
            <label className="col-sm-2 col-form-label">File description</label>
            <div className="col-sm-7">
              <input type="text" className="form-control col-sm-12" readOnly={true} value={this.state.contractFileDescription}></input>
            </div>
          </div>
          <div className="form-group row">
            <label className="col-sm-2 col-form-label">IPFS content hash</label>
            <div className="col-sm-7">
              <input type="text" className="form-control col-sm-12" readOnly={true} value={this.state.contractIpfsHash}></input>
            </div>
            {!this.state.contractFileDescription && !this.state.contractIpfsHash ?
            <div className="col-sm-3">
              <button type="button" className="btn btn-primary" 
                      onClick={() => this.getContractValues()}>
                Get contract values
              </button>
            </div> : null }
          </div>
        </div> : null }

        { this.state.contractFileDescription && this.state.contractIpfsHash ?
        <div>
          <h6>Conclusion: Download file from IPFS using the IPFS content hash</h6>
          <div className="col-sm-3">
            <a href={this.state.ipfsLink}          
               target="_blank" rel="noopener noreferrer" className="btn btn-primary">
              Download file
            </a>
          </div>
        </div> : null }
      </main>
    );
  }
}

export default IPFS;
