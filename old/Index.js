//@flow

/*******************************************************************************
 * Imports
 *******************************************************************************/

import { Observable } from 'rxjs/Observable'
import { from } from 'rxjs/observable/from'
import 'rxjs/add/operator/defaultIfEmpty'
import 'rxjs/add/operator/mergeMap'
import 'rxjs/add/operator/pluck'

import { decode } from 'base-64'

import Github from 'tldr/Github'

import type { AjaxResponse } from 'rxjs/observable/dom/ajax'
import type { Options as GithubOptions } from 'tldr/Github'
import type { Command } from 'tldr/Command'

/*******************************************************************************
 * Type Definitions
 *******************************************************************************/

export type Options = GithubOptions

export type Index = Array<Command>

type Module = {
  search(cmd: Command): Observable;
}

/*******************************************************************************
 * Private 
 *******************************************************************************/

let _cache: Index = []

/*******************************************************************************
 * Public API
 *******************************************************************************/

export default (opts: Options): Module => {
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

  let byPlatform = (os: string): Function =>
    (cmd: Command): boolean => cmd.platform.indexOf(os) !== -1

  let byName = (name?: string): Function =>
    (cmd: Command): boolean => cmd.name === name

  let byStatus = (status: number): Function =>
    (res: AjaxResponse): boolean => res.status === status

  return { search }
}
