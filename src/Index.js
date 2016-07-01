//@flow

/*******************************************************************************
 * Imports
 *******************************************************************************/

import { Observable } from 'rxjs/observable'

import { decode } from 'base-64'

import Github from './Github'

import type { Options } from './Github'

/*******************************************************************************
 * Type Definitions
 *******************************************************************************/

export type Platform = 'common' | 'linux' | 'osx' | 'sunos'

export type Command = {
  name:     string;
  platform: Platform;
}

export type Index = {
  search(name: string): Command;
}

/*******************************************************************************
 * Public API
 *******************************************************************************/

export default (opts: Options): Index => {
  let { repository, branch } = opts

  let Repo = Github({
    repository: repository
  })

  let search = (name: string): Command => {
    return getIndex()
      .filter( byName(name) )
  }

  let getIndex = () => {
    return Repo.get({
        path: "/assets/index.json",
        branch: branch
      })
      .filter(byStatus(200))
      .pluck('response')
      .pluck('content')
      .map(decode)
      .map(JSON.parse)
  }

  let byName = (name: string): Function => cmd => cmd.name === name
  let byStatus = (status: number): Function => res => res.status === status

  return { search }
}
