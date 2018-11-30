import React, { Component } from 'react';
import { HashRouter as Router, Route, Link } from 'react-router-dom';
import Configure from './Configure'
import HDwallet from './HDwallet'
import IPFS from './IPFS'
import OpenLaw from './OpenLaw'
import IDregistry from './IDregistry'
import AuditLog from './AuditLog'
import Chainlink from './Chainlink'
import './App.css';

class App extends Component {
  render() {
    return (
      <Router basename={process.env.PUBLIC_URL}>
        <div>
          <header className="samplesHeader">
            <div className="row col-sm-12">
              <div className="col-sm-2"></div>
              <div className="col-sm-2">
                <img src={process.env.PUBLIC_URL + '/imgs/logo.svg'} alt="" className="mk-logo__title"></img>
                <br />
                <small style={{color:'white'}}>samples gallery</small>
              </div>
              <div className="col-sm-8">
                <Link to="/">
                  <button className="btn btn-link">CONFIGURE</button>
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
            </div>
          </header>
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
