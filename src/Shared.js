import React from 'react';
import { Link } from 'react-router-dom';

function MissingConfig(props) {
  return (
    <main>
      <div className="container">
        <h2>{props.header}</h2>
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
