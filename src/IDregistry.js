import React, { Component } from 'react';
import utils from './utils'
import MissingConfig from './Shared'
import './App.css';
import JSONPretty from 'react-json-pretty';

class IDregistry extends Component {
  constructor(props) {
    super(props)
    utils.bindLocalStorage(this)
    this.state = {     
      missingConfig: false,
      fetchingDirectory: false,
      idProof: '',
      idProofLocked: false,
      privateKey: '',
      privateKeyLocked: false,
      accountOwner: '',
      accountOwnerValid: false,
      accountOwnerLocked: false,
      nameSuffix: '',
      nameSuffixLocked: false,
      namePrefix: '',
      createdOrg: false,
      creatingOrg: false,
      membershipId: '',
      membershipIdLocked: false,
      createdOrgIdJSON: ''
    }
  }

  componentDidMount = () => {
    if (!this.appCredsUsername || !this.appCredsPassword || !this.nodeRpcEndpoint || !this.idRegistryRpcEndpoint ||
        !this.apiKey || !this.consortiaId) {
      this.setState(() => ({
        missingConfig: true
      }))
      return
    }
    this.environmentId = utils.parseEnvironmentId(this.idRegistryRpcEndpoint)
    this.serviceUrl = `http://localhost:9100/api/v1/idregistry/${utils.parseServiceId(this.idRegistryRpcEndpoint)}`
  }

  membershipIdChanged = (event) => {
    const val = event.target.value
    this.setState(() => ({
      membershipId: val
    }));
  };

  lockMembershipId = () => {
    this.setState(() => ({
      membershipIdLocked: true
    }))
  };

  idProofChanged = (event) => {
    const val = event.target.value
    this.setState(() => ({
      idProof: val
    }));
  };

  lockIdProof = () => {
    let t = this
    this.setState(() => ({
      idProofLocked: true
    }), () => {
      let cert = new window.X509();
      cert.readCertPEM(this.state.idProof);
      let certInfo = cert.getInfo()
      console.log('cert', certInfo)
      
      let cnStarts = certInfo.indexOf('/CN=zz') + 4
      let cnLength = certInfo.slice(cnStarts).indexOf('\n')
      t.setState(() => ({
        namePrefix: certInfo.slice(cnStarts, cnStarts + cnLength)
      }))
    });
  };

  accountOwnerChanged = (event) => {
    const val = event.target.value
    this.setState(() => ({
      accountOwner: val,
      accountOwnerValid: val.startsWith('0x') && val.length === 42
    }));
  };

  lockAccountOwner = () => {
    this.setState(() => ({
      accountOwnerLocked: true
    }), () => {
    });
  };

  privateKeyChanged = (event) => {
    const val = event.target.value
    this.setState(() => ({
      privateKey: val
    }));
  };

  lockPrivateKey = () => {
    this.setState(() => ({
      privateKeyLocked: true
    }))
  };

  nameSuffixChanged = (event) => {
    const val = event.target.value
    this.setState(() => ({
      nameSuffix: val
    }));
  };

  lockNameSuffix = () => {
    this.setState(() => ({
      nameSuffixLocked: true
    }), () => {
    });
  };

  getNonce = () => {
    var headers = new Headers();
    headers.append('Authorization', `Bearer ${this.apiKey}`)
    headers.append('Content-Type', 'application/json',)
    let url = `${this.serviceUrl}/nonce`
    return fetch(url, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify({membership_id: this.state.membershipId})
    }).then(response => response.json()).then(response => response.nonce)
  };

  createOrg = () => {
    let t = this
    this.setState(() => ({
      creatingOrg: true
    }), async () => {
      let nonce = await this.getNonce()

      let payload = {
        envId: t.environmentId,
        nonce: nonce,
        name: t.state.namePrefix + t.state.nameSuffix,
        proof: t.state.idProof,
        address: t.state.accountOwner
      };

      let jws = window.KJUR.jws.JWS.sign(null, { alg: 'ES256' }, payload, t.state.privateKey);
      let jwsjs = new window.KJUR.jws.JWSJS();
      jwsjs.initWithJWS(jws);

      let doc = {
        consortia_id: t.consortiaId,
        environment_id: t.environmentId,
        membership_id: t.state.membershipId,
        jwsjs: jwsjs.getJSON()
      };
      
      var headers = new Headers();
      headers.append('Authorization', `Bearer ${t.apiKey}`)
      headers.append('Content-Type', 'application/json',)
      let url = `${t.serviceUrl}/identity`
      return fetch(url, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(doc)
      }).then(response => response.json()).then(response => {
        t.setState(() => ({
          createdOrgIdJSON: JSON.stringify(response)
        }))
      })
    });
  };

  render() {
    if (this.state.missingConfig) {
      return (
        <MissingConfig header="ID Registry" headerImage="/imgs/idregistry.png" />
      )
    }
    return (
      <main className="container">
        <h2 className="pageHeader clearfix">
          <div className="headerImage">
            <img style={{maxWidth: '100%', maxHeight: '100%'}} alt=""
                src={process.env.PUBLIC_URL + '/imgs/idregistry.png'} />
          </div>
          <div className="headerText">ID Registry</div>
        </h2>
        <h5>
          The purpose of this sample is to show how you can use Kaleido's ID Registry service to create and bind a verified 
          organizational identity with an Ethereum account.
        </h5>
        <br />    

        <div>
          <h6>
            To proceed with this sample, there are a couple of prerequisites. 
            You need to have already created a a secp256r1 private key. You then need to have used this key to sign 
            and create a x509 cert for your membership&nbsp;
            <a target="_blank" rel="noopener noreferrer" 
               href="https://docs.kaleido.io/developer-materials/obtaining-an-x509-certificate-for-asserted-kaleido-identities/">
               as described here
            </a>. Once that's done, you will need to enter the membership's ID below.</h6>
          <div className="form-group row">
            <label className="col-sm-2 col-form-label">Membership ID</label>
            <div className="col-sm-3">
              <input type="text" disabled={this.state.membershipIdLocked} onChange={this.membershipIdChanged} 
                     className="form-control" value = {this.state.membershipId} />
              <small>ex: zzw8fmpyxm</small>
            </div>
            { !this.state.membershipIdLocked ?
            <div className="col-sm-3">
              <button disabled={!this.state.membershipId} 
                      type="button" className="btn btn-primary" onClick={() => this.lockMembershipId()}>
                Next
              </button>
            </div> : null }
          </div>
        </div>
        
        { this.state.membershipIdLocked ? 
        <div>
          <hr />
          <h6>Enter the x509 certificate that was used to create your Membership's identity below.</h6>
          <div className="form-group row">
            <label className="col-sm-2 col-form-label">Membership x509 certificate</label>
            <div className="col-sm-7">
              <textarea disabled={this.state.idProofLocked} onChange={this.idProofChanged} 
                        className="form-control"
                        rows="3" value = {this.state.idProof} />
              <small>ex: -----BEGIN CERTIFICATE-----  ...  -----END CERTIFICATE-----</small>
            </div>
            { !this.state.idProofLocked ?
            <div className="col-sm-3">
              <button disabled={!this.state.idProof} 
                      type="button" className="btn btn-primary" onClick={() => this.lockIdProof()}>
                Next
              </button>
            </div> : null }
          </div>
        </div> : null }

        { this.state.idProofLocked ?
        <div>
          <hr />
          <h6>
            Enter your private key below (without encryption, in .pk8 form). To prove ownership of the supplied certificate, 
            this must be the same private key that was used to sign the x509 above. 
            To convert your private key to .pk8 form,&nbsp; 
            <a target="_blank" rel="noopener noreferrer" 
               href="https://docs.kaleido.io/kaleido-services/id-registry">
               follow the instructions here
            </a>
            &nbsp;on the Technical Info tab under the heading Environment Variables and Key Encryption. 
          </h6>
          <div className="form-group row">
            <label className="col-sm-2 col-form-label">Private Key PEM</label>
            <div className="col-sm-7">
              <textarea disabled={this.state.privateKeyLocked} onChange={this.privateKeyChanged} 
                        className="form-control"
                        rows="3" value = {this.state.privateKey} />
              <small>ex: -----BEGIN PRIVATE KEY-----  ...  -----END PRIVATEKEY-----</small>
            </div>
            { !this.state.privateKeyLocked ?
            <div className="col-sm-3">
              <button disabled={!this.state.privateKey} 
                      type="button" className="btn btn-primary" onClick={() => this.lockPrivateKey()}>
                Next
              </button>
            </div> : null }
          </div>
        </div> : null }

        { this.state.privateKeyLocked ? 
        <div>
          <hr />
          <h6>
            Optional: Enter the name descriptor suffix for the organizational identity to be created. The prefix is locked and 
            serves to identify the organization with the common name from the identity.
          </h6>
          <div className="form-group row">
            <label className="col-sm-2 col-form-label">Organizational identity name</label>
            <div className="input-group col-sm-7">
              <div className="input-group-prepend">
                <span className="form-control input-group-text" id="basic-addon3">{this.state.namePrefix}</span>
              </div>
              <input type="text" disabled={this.state.nameSuffixLocked} onChange={this.nameSuffixChanged}
                      value = {this.state.nameSuffix}
                      className="form-control" aria-describedby="basic-addon3" />
            </div>
            { !this.state.nameSuffixLocked ?
            <div className="col-sm-3">
              <button type="button" className="btn btn-primary" onClick={() => this.lockNameSuffix()}>
                Next
              </button>
            </div> : null }
          </div>
        </div> : null }

        { this.state.nameSuffixLocked ? 
        <div>
          <hr />
          <h6>Enter the Ethereum address for the owner of the organization to be created.</h6>
          <div className="form-group row">
            <label className="col-sm-2 col-form-label">ETH owner account</label>
            <div className="col-sm-7">
              <input type="text" disabled={this.state.accountOwnerLocked} onChange={this.accountOwnerChanged} 
                      className="form-control" value = {this.state.accountOwner} />
              <small>ex: 0x0000000000000000000000000000000000000000</small>
            </div>
            { !this.state.accountOwnerLocked ?
            <div className="col-sm-3">
              <button disabled={!this.state.accountOwner || !this.state.accountOwnerValid} 
                      type="button" className="btn btn-primary" onClick={() => this.lockAccountOwner()}>
                Next
              </button>
            </div> : null }
          </div>
        </div> : null }
        
        { this.state.accountOwnerLocked && !this.state.createdOrg && !this.state.createdOrgIdJSON ? 
        <div>
          <hr />
          <h6>
            All set, now we can create the organizational identity which will be bound to the ETH account above!
          </h6>
          <div className="col-sm-3">
            <button type="button" className="btn btn-success" 
                    disabled={ this.state.creatingOrg }
                    onClick={() => this.createOrg()}>
              { this.state.creatingOrg ? "Creating organization identity..." : "Create organization identity!" }
            </button>
          </div>
        </div> : null }

        { this.state.createdOrgIdJSON ?
        <div>
          <hr />
          <h6>
            The organizational identity has been created! See details below:
          </h6>
          <pre style={{backgroundColor:'#F3F2F2'}}>
            <code>
              <JSONPretty style={{marginLeft:'15px'}} id="json-pretty" json={this.state.createdOrgIdJSON} className="form-control-plaintext"></JSONPretty>
            </code>
          </pre>
        </div> : null }

      </main>
    );
  }
}

export default IDregistry;
