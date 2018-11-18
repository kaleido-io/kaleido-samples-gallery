import React from 'react';
import { Link } from 'react-router-dom';
import './App.css';

function MissingConfig(props) {
  return (
    <main>
      <div className="container">
        <h2 className="pageHeader clearfix">
          <div className="headerImage">
            <img style={{maxWidth: '100%', maxHeight: '100%'}} alt=""
                src={process.env.PUBLIC_URL + props.headerImage} />
          </div>
          <div className="headerText">{props.header}</div>
        </h2>
        missing&nbsp;
        <Link to="/">
          config
        </Link>
        <br /><br />
        <p>{props.text}</p>
        <br />
        <div>{props.supplemental}</div>
        <br />
      </div>
    </main>
  )
}

export default MissingConfig;
