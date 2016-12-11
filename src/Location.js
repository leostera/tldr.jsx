//@flow

/*******************************************************************************
 * Imports
 *******************************************************************************/

import { parse } from 'query-string'

import compact from 'tldr/lib/array.compact'

import type { Command } from 'tldr/Command'
import type { Options } from 'tldr/Github'

import type { Location } from 'history'

/*******************************************************************************
 * Public API
 *******************************************************************************/

const agent = window.navigator.userAgent
const match = (agent, string) => agent.match(string).length > 0

const getDefaultPlatform = () => {
  if( match(agent, 'OS X') )  return 'osx'
  if( match(agent, 'Linux') ) return 'linux'
  if( match(agent, 'Sun') )   return 'sunos'
  return 'common'
}

const defaultPlatform = getDefaultPlatform()

let toCommand = (location: Location): Command => {
  let parts = compact(location.pathname.split('/'))
  let res: Command
  switch(parts.length) {
    case 2:
      res = { name: parts[1], platform: parts[0] }
    break
    case 1:
    default:
      res = { name: parts[0], platform: defaultPlatform }
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
