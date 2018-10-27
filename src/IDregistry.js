import React, { Component } from 'react';
import utils from './utils'
import MissingConfig from './Shared'

class IDregistry extends Component {
  constructor(props) {
    super(props)
    utils.bindLocalStorage(this)
    utils.buildWeb3(this)
    this.state = {     
      missingConfig: false,
      fetchingDirectory: false,
      directoryContractAddress: ''
    }
  }

  componentDidMount = () => {
    if (!this.appCredsUsername || !this.appCredsPassword || !this.nodeRpcEndpoint || !this.idRegistryRpcEndpoint) {
      this.setState(() => ({
        missingConfig: true
      }))
    }
  }

  fetchDirectory = () => {
    this.setState(() => ({
      fetchingDirectory: true
    }), () => {
      var headers = new Headers();
      headers.append('Authorization', 'Basic ' + btoa(this.appCredsUsername + ':' + this.appCredsPassword));
      headers.append('Accept', 'application/json, text/plain, */*',)
      let url = `${this.idRegistryRpcEndpoint}/api/v1/directories`
      fetch(url, {
        method: 'GET',
        headers: headers
      }).then(response => response.json())
      .then(response => {
        let dir = response[0]
        this.setState(() => ({
          directoryContractAddress: dir.directory
        }))
      })
    })
  }

  render() {
    if (this.state.missingConfig) {
      return (
        <MissingConfig header="ID Registry" />
      )
    }
    return (
      <main className="container">
        <h2>ID Registry</h2>
        <h5>
          The purpose of this sample is to show how you can use Kaleido's ID Registry service to create an organization and
          add users to that organization.
        </h5>
        <br />    
        { !this.state.directoryContractAddress ? 
        <div>
          <h6>
            Fetch directory contract address from ID Registry service
          </h6>
          <div className="col-sm-5">
            <button disabled={this.state.fetchingDirectory} type="button" className="btn btn-primary" 
                    onClick={() => this.fetchDirectory()}>
              Get contract address
            </button>
          </div> 
        </div> : 
        
        <div>
          <h6>
            The directories contract has been deployed to the following address: <i>{this.state.directoryContractAddress}</i>.
          </h6>
          <h6>
            Next up: let's bind your verified organizational identity (i.e. the validated x509 cert) with an Ethereum account and establish an on-chain organizational identity
          </h6>
        </div>
        }

      </main>
    );
  }
}

export default IDregistry;
