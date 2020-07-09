//@flow

/*******************************************************************************
 * Imports
 *******************************************************************************/

import React from 'react'

import type { State } from 'tldr/Tldr'

import { parse, stringify } from 'query-string'

/*******************************************************************************
 * Public API
 *******************************************************************************/

export default (props: State) => {
  let { params: { history } } = props

  let close = (e) => {
    let location = history.location
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
