import React, { Component } from 'react';
import { HashRouter as Router, Route, Link } from 'react-router-dom';
import Configure from './Configure'
import HDwallet from './HDwallet'
import IPFS from './IPFS'
import OpenLaw from './OpenLaw'
import IDregistry from './IDregistry'
import AuditLog from './AuditLog'
import Chainlink from './Chainlink'

class App extends Component {
  render() {
    return (
      <Router basename={process.env.PUBLIC_URL}>
        <div>
          <header className="">
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
              <Link to="/auditlog">
                <button className="btn btn-link">Audit Log</button>
              </Link>
              <Link to="/chainlink">
                <button className="btn btn-link">Chainlink</button>
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
            <Route exact path="/auditlog" component={AuditLog} />
            <Route exact path="/chainlink" component={Chainlink} />
          </div>
        </div>
      </Router>
    );
  }
}

export default App;
