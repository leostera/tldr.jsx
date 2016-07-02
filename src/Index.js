//@flow

/*******************************************************************************
 * Imports
 *******************************************************************************/

import { Observable } from 'rxjs/observable'
import { from } from 'rxjs/observable/from'
import 'rxjs/add/operator/defaultIfEmpty'
import 'rxjs/add/operator/mergeMap'
import 'rxjs/add/operator/pluck'

import { decode } from 'base-64'

import Github from './Github'

import type { Options } from './Github'
import type { Command } from './Command'

/*******************************************************************************
 * Type Definitions
 *******************************************************************************/

export type Index = Array<Command>

export type IndexModule = {
  search(cmd: Command): Observable;
}

/*******************************************************************************
 * Private 
 *******************************************************************************/

let _cache: Index = []

/*******************************************************************************
 * Public API
 *******************************************************************************/

export default (opts: Options): IndexModule => {
  let { repository, branch } = opts

  let Repo = Github({
    repository: repository
  })

  let search = ({name, platform}: Command): Observable => {
    return getIndex()
      .filter( byName(name) )
      .filter( byPlatform(platform) )
      .defaultIfEmpty(false)
  }

  let saveCache = ({commands}) => _cache = commands

  let getIndex = () => {
    if (_cache.length > 0) {
      return from(_cache)
    } else {
      return Repo.get({
          path: "assets/index.json",
          branch: branch
        })
        .filter(byStatus(200))
        .pluck('response')
        .pluck('content')
        .map(decode)
        .map(JSON.parse)
        .do(saveCache)
        .mergeMap( index => index.commands )
    }
  }

  let byPlatform = (os: string): Function => cmd => cmd.platform.indexOf(os) !== -1
  let byName = (name: string): Function => cmd => cmd.name === name
  let byStatus = (status: number): Function => res => res.status === status

  return { search }
}
