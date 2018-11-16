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
    this.openlawAccountEmail = React.createRef()
    this.openlawAccountPassword = React.createRef()
    // this.idRegistryRpcEndpoint = React.createRef()
    this.chainlinkLinkAddr = React.createRef()
    this.chainlinkOracleAddr = React.createRef()
    this.chainlinkApiEndpoint = React.createRef()
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
    this.openlawAccountEmail.current.value = localStorage.getItem('openlawAccountEmail');
    this.openlawAccountPassword.current.value = localStorage.getItem('openlawAccountPassword');
    // this.idRegistryRpcEndpoint.current.value = localStorage.getItem('idRegistryRpcEndpoint');
    this.chainlinkLinkAddr.current.value = localStorage.getItem('chainlinkLinkAddr');
    this.chainlinkOracleAddr.current.value = localStorage.getItem('chainlinkOracleAddr');
    this.chainlinkApiEndpoint.current.value = localStorage.getItem('chainlinkApiEndpoint');
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
    localStorage.setItem('openlawAccountEmail', this.openlawAccountEmail.current.value);
    localStorage.setItem('openlawAccountPassword', this.openlawAccountPassword.current.value);
    // localStorage.setItem('idRegistryRpcEndpoint', this.idRegistryRpcEndpoint.current.value);
    localStorage.setItem('chainlinkLinkAddr', this.chainlinkLinkAddr.current.value);
    localStorage.setItem('chainlinkOracleAddr', this.chainlinkOracleAddr.current.value);
    localStorage.setItem('chainlinkApiEndpoint', this.chainlinkApiEndpoint.current.value);
    alert('latest settings saved!')
  }

  resetLocalStorage = () => {
    localStorage.clear();
    window.location.reload()
  }

  render() {
    return (
      <main className="container">
        <h2>Configure</h2>
        <h5>
          Welcome to the Kaleido samples gallery! In order for the samples to connect to your 
          Kaleido environment, you will need to provide the configuration settings below.
          All settings saved on this page will be persisted to browser local storage.
        </h5>
        <br />
        <h5>Shared</h5>
        <div className="form-group row">
          <label className="col-sm-3 col-form-label">App credentials username</label>
          <div className="col-sm-4">
            <input type="text" className="form-control col-sm-12" ref={this.appCredsUsername} />
          </div>
        </div>
        <div className="form-group row">
          <label className="col-sm-3 col-form-label">App credentials password</label>
          <div className="col-sm-6">
            <input type="password" className="form-control col-sm-12" ref={this.appCredsPassword} />
          </div>
        </div>
        <div className="form-group row">
          <label className="col-sm-3 col-form-label">Node RPC endpoint</label>
          <div className="col-sm-6">
            <input type="text" className="form-control col-sm-12" ref={this.nodeRpcEndpoint} />
            <small>(ex: https://zz..-zz..-rpc.us-east-2.kaleido.io)</small>
          </div>
        </div>
        <h5>HDWallet</h5>
        <div className="form-group row">
          <label className="col-sm-3 col-form-label">Consortia ID (for block explorer)</label>
          <div className="col-sm-4">
            <input type="text" className="form-control col-sm-12" ref={this.consortiaId} />
            <small>(ex: zzabcd1234)</small>
          </div>
        </div>
        <div className="form-group row">
          <label className="col-sm-3 col-form-label">HDWallet RPC endpoint</label>
          <div className="col-sm-6">
            <input type="text" className="form-control col-sm-12" ref={this.hdwalletRpcEndpoint} />
            <small>(ex: https://zz..-zz..-hdwallet.us-east-2.kaleido.io)</small>
          </div>
        </div>
        <div className="form-group row">
          <label className="col-sm-3 col-form-label">HDWallet wallet ID</label>
          <div className="col-sm-4">
            <input type="text" className="form-control col-sm-12" ref={this.hdwalletWalletId} />
          </div>
        </div>
        <h5>IPFS</h5>
        <div className="form-group row">
          <label className="col-sm-3 col-form-label">IPFS RPC endpoint</label>
          <div className="col-sm-6">
            <input type="text" className="form-control col-sm-12" ref={this.ipfsRpcEndpoint} />
            <small>(ex: https://zz..-zz..-ipfs.us-east-2.kaleido.io)</small>
          </div>
        </div>
        {/* <h5>ID Registry</h5>
        <div className="form-group row">
          <label className="col-sm-2 col-form-label">ID Registry RPC endpoint</label>
          <div className="col-sm-6">
            <input type="text" className="form-control col-sm-12" ref={this.idRegistryRpcEndpoint} />
            <small>(ex: https://zz..-zz..-idregistry.us-east-2.kaleido.io)</small>
          </div>
        </div> */}
        <h5>OpenLaw</h5>
        <div className="form-group row">
          <label className="col-sm-3 col-form-label">OpenLaw RPC endpoint</label>
          <div className="col-sm-6">
            <input type="text" className="form-control col-sm-12" ref={this.openlawRpcEndpoint} />
            <small>(ex: https://zz..-zz..-openlaw.us-east-2.kaleido.io)</small>
          </div>
        </div>
        <div className="form-group row">
          <label className="col-sm-3 col-form-label">OpenLaw account email</label>
          <div className="col-sm-6">
            <input type="text" className="form-control col-sm-12" ref={this.openlawAccountEmail} />
          </div>
        </div>
        <div className="form-group row">
          <label className="col-sm-3 col-form-label">OpenLaw account password</label>
          <div className="col-sm-6">
            <input type="password" className="form-control col-sm-12" ref={this.openlawAccountPassword} />
          </div>
        </div>
        <h5>Chainlink</h5>
        <div className="form-group row">
          <label className="col-sm-3 col-form-label">Chainlink API endpoint</label>
          <div className="col-sm-6">
            <input type="text" className="form-control col-sm-12" ref={this.chainlinkApiEndpoint} />
            <small>(ex: https://zz..-zz..-chainlink.dev-svcs.photic.io)</small>
          </div>
        </div>
        <div className="form-group row">
          <label className="col-sm-3 col-form-label">Link Contract Address</label>
          <div className="col-sm-6">
            <input type="text" className="form-control col-sm-12" ref={this.chainlinkLinkAddr} />
            <small>(ex: 0x145e7Aa18A4A5874c92eb177972173320F217c19)</small>
          </div>
        </div>        
        <div className="form-group row">
          <label className="col-sm-3 col-form-label">Oracle Contract Address</label>
          <div className="col-sm-6">
            <input type="text" className="form-control col-sm-12" ref={this.chainlinkOracleAddr} />
            <small>(ex: 0xb4acb933676c0a76d9bb5f10791cb6d82c71f19d)</small>
          </div>
        </div>        
        {/* <div className="form-group row">
          <label className="col-sm-3 col-form-label">Chainlink username/email</label>
          <div className="col-sm-6">
            <input type="text" className="form-control col-sm-12" ref={this.chainlinkEmail} />
            <small>(ex: 992ad8782cf38f7e@5e1be1892c901e94.com)</small>
          </div>
        </div>  
        <div className="form-group row">
          <label className="col-sm-3 col-form-label">Chainlink password</label>
          <div className="col-sm-6">
            <input type="text" className="form-control col-sm-12" ref={this.chainlinkPassword} />
            <small>(ex: 552d08dffd651499)</small>
          </div>
        </div>   */}
        <div className="form-group row">
          <div className="col-sm-3"></div>
          <div className="col-sm-2">
            <button type="button" className="btn btn-success" onClick={() => this.updateLocalStorage()}>
              Save
            </button>
          </div>
          <div className="col-sm-2">
            <button type="button" className="btn btn-sm btn-warning" onClick={() => this.resetLocalStorage()}>
              Reset all
            </button>
          </div>
        </div>
        <br /><br /><br />
      </main>
    );
  }
}

export default Configure;
