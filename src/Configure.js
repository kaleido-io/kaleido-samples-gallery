import React, { Component } from 'react';
// import { PrimaryButton } from '@photic/design-kit';

class Configure extends Component {
  constructor(props) {
    super(props)
    this.consortiaId = React.createRef()
    this.appCredsUsername = React.createRef()
    this.appCredsPassword = React.createRef()
    this.nodeRpcEndpoint = React.createRef()
    this.hdwalletRpcEndpoint = React.createRef()
    this.hdwalletWalletId = React.createRef()
    this.ipfsRpcEndpoint = React.createRef()
    this.openlawRpcEndpoint = React.createRef()
    this.idRegistryRpcEndpoint = React.createRef()
  }

  componentDidMount() {
    this.consortiaId.current.value = localStorage.getItem('consortiaId');
    this.appCredsUsername.current.value = localStorage.getItem('appCredsUsername');
    this.appCredsPassword.current.value = localStorage.getItem('appCredsPassword');
    this.nodeRpcEndpoint.current.value = localStorage.getItem('nodeRpcEndpoint');
    this.hdwalletRpcEndpoint.current.value = localStorage.getItem('hdwalletRpcEndpoint');
    this.hdwalletWalletId.current.value = localStorage.getItem('hdwalletWalletId');
    this.ipfsRpcEndpoint.current.value = localStorage.getItem('ipfsRpcEndpoint');
    this.openlawRpcEndpoint.current.value = localStorage.getItem('openlawRpcEndpoint');
    this.idRegistryRpcEndpoint.current.value = localStorage.getItem('idRegistryRpcEndpoint');
  }

  updateLocalStorage = () => {
    localStorage.setItem('consortiaId', this.consortiaId.current.value);
    localStorage.setItem('appCredsUsername', this.appCredsUsername.current.value);
    localStorage.setItem('appCredsPassword', this.appCredsPassword.current.value);
    localStorage.setItem('nodeRpcEndpoint', this.nodeRpcEndpoint.current.value);
    localStorage.setItem('hdwalletRpcEndpoint', this.hdwalletRpcEndpoint.current.value);
    localStorage.setItem('hdwalletWalletId', this.hdwalletWalletId.current.value);
    localStorage.setItem('ipfsRpcEndpoint', this.ipfsRpcEndpoint.current.value);
    localStorage.setItem('openlawRpcEndpoint', this.openlawRpcEndpoint.current.value);
    localStorage.setItem('idRegistryRpcEndpoint', this.idRegistryRpcEndpoint.current.value);
    alert('latest settings saved!')
  }

  render() {
    return (
      <main className="container">
        <h2>Configure</h2>
        <h5>
          This is needed so the samples can connect to your Kaleido environment. All information will be
          persisted to browser local storage.
        </h5>
        <br />
        <h5>Shared</h5>
        <div className="form-group row">
          <label className="col-sm-2 col-form-label">Consortia ID</label>
          <div className="col-sm-4">
            <input type="text" className="form-control col-sm-12" ref={this.consortiaId} />
            <small>(ex: zzabcd1234)</small>
          </div>
        </div>
        <div className="form-group row">
          <label className="col-sm-2 col-form-label">App credentials username</label>
          <div className="col-sm-4">
            <input type="text" className="form-control col-sm-12" ref={this.appCredsUsername} />
          </div>
        </div>
        <div className="form-group row">
          <label className="col-sm-2 col-form-label">App credentials password</label>
          <div className="col-sm-6">
            <input type="password" className="form-control col-sm-12" ref={this.appCredsPassword} />
          </div>
        </div>
        <div className="form-group row">
          <label className="col-sm-2 col-form-label">Node RPC endpoint</label>
          <div className="col-sm-6">
            <input type="text" className="form-control col-sm-12" ref={this.nodeRpcEndpoint} />
            <small>(ex: http://zz..-zz..-rpc.us-east-2.kaleido.io)</small>
          </div>
        </div>
        <h5>HDWallet</h5>
        <div className="form-group row">
          <label className="col-sm-2 col-form-label">HDWallet RPC endpoint</label>
          <div className="col-sm-6">
            <input type="text" className="form-control col-sm-12" ref={this.hdwalletRpcEndpoint} />
            <small>(ex: https://zz..-zz..-hdwallet.us-east-2.kaleido.io)</small>
          </div>
        </div>
        <div className="form-group row">
          <label className="col-sm-2 col-form-label">HDWallet wallet ID</label>
          <div className="col-sm-4">
            <input type="text" className="form-control col-sm-12" ref={this.hdwalletWalletId} />
          </div>
        </div>
        <h5>IPFS</h5>
        <div className="form-group row">
          <label className="col-sm-2 col-form-label">IPFS RPC endpoint</label>
          <div className="col-sm-6">
            <input type="text" className="form-control col-sm-12" ref={this.ipfsRpcEndpoint} />
            <small>(ex: https://zz..-zz..-ipfs.us-east-2.kaleido.io)</small>
          </div>
        </div>
        <h5>ID Registry</h5>
        <div className="form-group row">
          <label className="col-sm-2 col-form-label">ID Registry RPC endpoint</label>
          <div className="col-sm-6">
            <input type="text" className="form-control col-sm-12" ref={this.idRegistryRpcEndpoint} />
            <small>(ex: http://zz..-zz..-idregistry.us-east-2.kaleido.io)</small>
          </div>
        </div>
        <h5>OpenLaw</h5>
        <div className="form-group row">
          <label className="col-sm-2 col-form-label">OpenLaw RPC endpoint</label>
          <div className="col-sm-6">
            <input type="text" className="form-control col-sm-12" ref={this.openlawRpcEndpoint} />
            <small>(ex: http://zz..-zz..-openlaw.us-east-2.kaleido.io)</small>
          </div>
        </div>
        <div className="form-group row">
          <div className="col-sm-6">
          <button type="button"className="btn btn-success" onClick={() => this.updateLocalStorage()}>
            Save
          </button>
          </div>
        </div>
      </main>
    );
  }
}

export default Configure;
