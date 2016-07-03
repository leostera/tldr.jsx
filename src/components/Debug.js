//@flow

import React from 'react'

import { parse, stringify } from 'query-string'

export default (props) => {
  let { state: { history } } = props

  let close = (e) => {
    let location = history.getCurrentLocation()
    let search = parse(location.search)
    delete search.debug
    location.search = stringify(search)
    history.push(location)
  }

  return (
    <pre className="debug">
      <span onClick={close}>✕</span>
      <h2>Debug:</h2>
      {JSON.stringify(props, null, "  ")}
    </pre>
  )
}
