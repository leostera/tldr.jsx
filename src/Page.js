//@flow

/*******************************************************************************
 * Imports
 *******************************************************************************/

import { Observable } from 'rxjs/observable'
import { from } from 'rxjs/observable/from'
import { concat } from 'rxjs/operator/concat'

import { decode } from 'base-64'

import Github from './Github'
import type { Options } from './Github'

import type { Command } from './Command'

/*******************************************************************************
 * Type Definitions
 *******************************************************************************/

export type Path = string

export type Page = {
  cmd:  Command;
  path: Path;
  body: string;
}

export type PageModule = {
  get(cmd: Command): Observable;
}

/*******************************************************************************
 * Public API
 *******************************************************************************/

export default (opts: Options): PageModule => {
  let { repository, branch } = opts

  let Repo = Github({
    repository: repository
  })

  let get = ({name, platform}: Command): Observable => {
    let page =  Repo.get({
        path: `pages/${platform}/${name}.md`,
        branch: branch
      })

    let found = from(page)
      .filter(byStatus(200))
      .pluck('response')
      .map(toPage)

    let error = from(page)
      .filter(not(byStatus(200)))
      .map(toError)

    return concat.apply(found, [error])
  }

  let not = (f: Function): Function => res => ! f(res)
  let byStatus = (...statuses): Function =>
    res => statuses.indexOf(res.status) !== -1

  let toError = (data) => ({
    error: {
      message: data.message,
      status:  data.status
    }
  })

  let toPage = (data) => ({
    path: data.html_url,
    body: decode(data.content)
  })

  return { get: get }
}
