//@flow

/*******************************************************************************
 * Imports
 *******************************************************************************/

import { Observable } from 'rxjs/observable'
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
  search(name: string): Observable | false;
}

/*******************************************************************************
 * Public API
 *******************************************************************************/

export default (opts: Options): IndexModule => {
  let { repository, branch } = opts

  let Repo = Github({
    repository: repository
  })

  let search = (name: string): Observable => {
    return getIndex()
      .filter( byName(name) )
      .defaultIfEmpty(false)
  }

  let getIndex = () => {
    return Repo.get({
        path: "assets/index.json",
        branch: branch
      })
      .filter(byStatus(200))
      .pluck('response')
      .pluck('content')
      .map(decode)
      .map(JSON.parse)
      .mergeMap( index => index.commands )
  }

  let byName = (name: string): Function => cmd => cmd.name === name
  let byStatus = (status: number): Function => res => res.status === status

  return { search }
}
