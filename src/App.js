import React, { Component } from 'react';
import { BrowserRouter as Router, Route, Link } from 'react-router-dom';
import Configure from './Configure'
import HDwallet from './HDwallet'
import IPFS from './IPFS'
import OpenLaw from './OpenLaw'
import IDregistry from './IDregistry'

class App extends Component {
  render() {
    return (
      <Router>
        <div>
          <header className="">
            <link href="https://stackpath.bootstrapcdn.com/bootstrap/4.1.3/css/bootstrap.min.css" 
                  rel="stylesheet" 
                  integrity="sha384-MCw98/SFnGE8fJT3GXwEOngsV7Zt27NXFoaoApmYm81iuXoPkFOJwJ8ERdknLPMO" 
                  crossOrigin="anonymous" />
            <div>
              <Link to="/">
                <button className="btn btn-link">Configure</button>
              </Link>
              <Link to="/hdwallet">
                <button className="btn btn-link">HDWallet</button>
              </Link>
              <Link to="/ipfs">
                <button className="btn btn-link">IPFS</button>
              </Link>
              <Link to="/idregistry">
                <button className="btn btn-link">ID Registry</button>
              </Link>
              <Link to="/openlaw">
                <button className="btn btn-link">OpenLaw</button>
              </Link>
            </div>
          </header>
          <hr />
          <div>
            <Route exact path="/" component={Configure} />
            <Route exact path="/hdwallet" component={HDwallet} />
            <Route exact path="/ipfs" component={IPFS} />
            <Route exact path="/idregistry" component={IDregistry} />
            <Route exact path="/openlaw" component={OpenLaw} />
          </div>
        </div>
      </Router>
    );
  }
}

export default App;
