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
        <p>{props.text}</p>
      </div>
    </main>
  )
}

export default MissingConfig;
