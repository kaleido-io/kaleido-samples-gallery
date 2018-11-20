import Web3 from 'web3'

const utils = {
  bindLocalStorage(t) {
    t.consortiaId = localStorage.getItem('consortiaId');
    t.appCredsUsername = localStorage.getItem('appCredsUsername');
    t.appCredsPassword = localStorage.getItem('appCredsPassword');
    t.nodeRpcEndpoint = localStorage.getItem('nodeRpcEndpoint');
    t.hdwalletRpcEndpoint = localStorage.getItem('hdwalletRpcEndpoint');
    t.hdwalletWalletId = localStorage.getItem('hdwalletWalletId');
    t.ipfsRpcEndpoint = localStorage.getItem('ipfsRpcEndpoint');
    t.openlawRpcEndpoint = localStorage.getItem('openlawRpcEndpoint');
    t.openlawAccountEmail = localStorage.getItem('openlawAccountEmail');
    t.openlawAccountPassword = localStorage.getItem('openlawAccountPassword');
    t.idRegistryRpcEndpoint = localStorage.getItem('idRegistryRpcEndpoint');
    t.chainlinkLinkAddr = localStorage.getItem('chainlinkLinkAddr');
    t.chainlinkOracleAddr = localStorage.getItem('chainlinkOracleAddr');
    t.chainlinkApiEndpoint = localStorage.getItem('chainlinkApiEndpoint');
  },

  buildWeb3(t) {
    if (t.appCredsUsername && t.appCredsPassword && t.nodeRpcEndpoint) {
      t.web3 = priv.buildWeb3(t)
    }
  },

  getNewWeb3(t, useWebsocket = false) {
    if (t.appCredsUsername && t.appCredsPassword && t.nodeRpcEndpoint) {
      return priv.buildWeb3(t, useWebsocket)
    }
  },

  getContract(web3, contract, contractAddress, contractArgs) {
    let abi = JSON.parse(contract.abi);
    let bytecode = '0x' + contract.bytecode;
    try {
      let ret = new web3.eth.Contract(abi, contractAddress);
      if (!contractAddress) {
        // this is a new deployment, build the deploy object
        ret = ret.deploy({
          data: bytecode,
          arguments: contractArgs
        });
      }
      return ret;
    } catch(err) {
      console.error('Failed to get contract', err)
    }
    return null;
  },

  buildServiceUrlWithCreds(t, serviceRpcEndpoint, useWebsocket = false) {
    let isHttpOnly = serviceRpcEndpoint.startsWith('http://') ? true : false;
    let prefix = isHttpOnly ? 'http://' : 'https://'
    let protocol = useWebsocket ? (isHttpOnly ? "ws://" : "wss://") : prefix
    let endpoint = serviceRpcEndpoint.replace(prefix, '')
    if (useWebsocket) endpoint = endpoint.replace('-rpc.', '-wss.')
    return `${protocol}${t.appCredsUsername}:${t.appCredsPassword}@${endpoint}`
  }
}

const priv = {
  buildWeb3(t, useWebsocket = false) {
    if (useWebsocket) {
      return new Web3(new Web3.providers.WebsocketProvider(utils.buildServiceUrlWithCreds(t, t.nodeRpcEndpoint, useWebsocket)))  
    }
    return new Web3(utils.buildServiceUrlWithCreds(t, t.nodeRpcEndpoint, useWebsocket))
  }
}

export default utils 