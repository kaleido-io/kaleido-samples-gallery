import React, { Component } from 'react';
import utils from './utils'
import MissingConfig from './Shared'

class OpenLaw extends Component {
  constructor(props) {
    super(props)
    utils.bindLocalStorage(this)
    utils.buildWeb3(this)
    this.state = {     
      missingConfig: false,
      openlawUrl: '',
      sampleAgreement: `
      This is an angreement between two parties: [[PartyA | Uppercase]] and [[PartyB | Uppercase]] and is made as of [[Effective Date: Date]].  Both parties agree that the next time they see each other a high-five will take place in which one person raises their right-hand in a vertical orientation with their fingers and thumb either together or spread slightly apart and the other person does the same.  Then they slap their palms together in a momentary fashion to create a slappy noise.
        
**[[PartyA | Uppercase]]:**

[[PartyA Email: Identity]]
__________________________________________


**[[PartyB | Uppercase]]:**

[[PartyB Email: Identity]]
__________________________________________

      `,
      sampleAgreementTitle: 'High Five'
    }
  }

  componentDidMount = () => {
    if (!this.appCredsUsername || !this.appCredsPassword || !this.nodeRpcEndpoint || !this.openlawRpcEndpoint) {
      this.setState(() => ({
        missingConfig: true
      }))
      return
    }
    this.setState(() => ({
      openlawUrl: utils.buildServiceUrlWithCreds(this, this.openlawRpcEndpoint),
      openlawTemplateUrl: utils.buildServiceUrlWithCreds(this, this.openlawRpcEndpoint) + '/template/raw/test'
    }))
  }

  // fetchTemplate = () => {
  //   console.log('fetching')
  //   const headers = new Headers();
  //   headers.append('Authorization', 'Basic ' + btoa(this.appCredsUsername + ':' + this.appCredsPassword));
  //   headers.append('content-type', 'application/json')
  //   headers.append('Accept', 'application/json, text/plain, */*')
  //   let url = this.openlawRpcEndpoint + '/user/details?email=joseph.bonfiglio@consensys.net'
  //   // let url = this.openlawRpcEndpoint + '/template/raw/test'
  //   return fetch(url, {
  //     method: 'GET',
  //     headers: headers
  //   }).then(response => response.json())
  //   .then(response => console.log(response))
  // }

  // createTemplate = () => {
  //   console.log('creating')
  //   const headers = new Headers();
  //   headers.append('Authorization', 'Basic ' + btoa(this.appCredsUsername + ':' + this.appCredsPassword));
  //   headers.append('content-type', 'text/plain;charset=UTF-8')
  //   headers.append('Accept', 'application/json, text/plain, */*')
  //   let url = `${this.openlawRpcEndpoint}/upload/template/${this.state.sampleAgreementTitle}`
  //   return fetch(url, {
  //     method: 'POST',
  //     headers: headers,
  //     credentials: 'include'
  //   }).then(response => response.json())
  //   .then(response => console.log(response))
  // }

  render() {
    if (this.state.missingConfig) {
      return (
        <MissingConfig header="OpenLaw" />
      )
    }
    return (
      <main className="container">
        <h2>OpenLaw</h2>
        <h5>
          The purpose of this sample is to show how you can create an OpenLaw template which triggers an embedded smart contract 
          once it's signed by all parties involved.
        </h5>
        <br />
        <h6>
          Step 1: 
          <a href={this.state.openlawUrl} target="_blank" rel="noopener noreferrer" className="btn btn-link">
            Login to your OpenLaw instance and play
          </a>
        </h6>
        
        
      </main>
    );
  }
}

export default OpenLaw;
