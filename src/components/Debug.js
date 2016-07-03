import React from 'react'

export default (props) =>
  <pre className="debug">
    <h2>Debug:</h2>
    {JSON.stringify(props, null, "  ")}
  </pre>
