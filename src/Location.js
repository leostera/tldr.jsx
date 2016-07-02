//@flow

/*******************************************************************************
 * Imports
 *******************************************************************************/

import { parse } from 'query-string'

import compact from './array.compact'

import type { Command } from './Command'
import type { Options } from './Github'

/*******************************************************************************
 * Public API
 *******************************************************************************/

let toCommand = (location: Location): Command => {
  let parts = compact(location.pathname.split('/'))
  let res: Command
  switch(parts.length) {
    case 2:
      res = { name: parts[1], platform: parts[0] }
    break
    case 1:
    default:
      res = { name: parts[0], platform: "common" }
    break
  }
  return res
}

let toIndex = (location: Location): Options => {
  return Object.assign({
      branch: 'master',
      repository: 'tldr-pages/tldr-pages.github.io',
      timeout: 5000
    }, parse(location.search))
}

let isDebugging = (location: Location): boolean => {
  let { debug } = parse(location.search)
  return !!debug
}

export default {
  toCommand,
  toIndex,
  isDebugging
}
