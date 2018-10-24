import React, { Component } from 'react';
import utils from './utils'
import { Link } from 'react-router-dom';

class IDregistry extends Component {
  constructor(props) {
    super(props)
    utils.bindLocalStorage(this)
    utils.buildWeb3(this)
    this.state = {     
      missingConfig: false
    }
  }

  componentDidMount = () => {
  }

  render() {
    if (this.state.missingConfig) {
      return (
        <main className="container">
          <h2>IPFS</h2>
          missing&nbsp;
          <Link to="/">
            config
          </Link>
        </main>
      )
    }
    return (
      <main className="container">
        <h2>ID Registry</h2>
        <h5>
          coming soon
        </h5>
        <br />        
      </main>
    );
  }
}

export default IDregistry;
