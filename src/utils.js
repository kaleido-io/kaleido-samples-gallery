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
  },

  buildWeb3(t) {
    if (t.appCredsUsername && t.appCredsPassword && t.nodeRpcEndpoint) {
      priv.buildWeb3(t)
    }
  },

  getContract(web3, contract, contractAddress, contractArgs) {
    let abi = JSON.parse(contract.abi);
    let bytecode = '0x' + contract.bytecode;
    let ret = new web3.eth.Contract(abi, contractAddress);
    if (!contractAddress) {
      // this is a new deployment, build the deploy object
      ret = ret.deploy({
        data: bytecode,
        arguments: contractArgs
      });
    }
    return ret;
  },

  buildServiceUrlWithCreds(t, serviceRpcEndpoint) {
    let prefix = serviceRpcEndpoint.startsWith('http://') ? 'http://' : 'https://'
    return `${prefix}${t.appCredsUsername}:${t.appCredsPassword}@${serviceRpcEndpoint.replace(prefix, '')}`
  }
}

const priv = {
  buildWeb3(t) {
    t.web3 = new Web3(utils.buildServiceUrlWithCreds(t, t.nodeRpcEndpoint))
  }
}

export default utils 