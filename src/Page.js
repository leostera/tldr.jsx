//@flow

/*******************************************************************************
 * Imports
 *******************************************************************************/

import { Observable } from 'rxjs/observable'

import { decode } from 'base-64'

import Github from './Github'
import type  { Options } from './Github'

import type  { Command } from './Index'

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
  get(cmd: Command): Page;
}

/*******************************************************************************
 * Public API
 *******************************************************************************/

export default (opts: Options): PageModule => {
  let { repository, branch } = opts

  let Repo = Github({
    repository: repository
  })

  let get = ({name, platform}: Command): Page => {
    return Repo.get({
        path: `/${platform}/${name}.md`,
        branch: branch
      })
      .filter(byStatus(200))
      .pluck('response')
      .map(toPage)
  }

  let byStatus = (status: number): Function => res => res.status === status

  let toPage = (data) => {
    let path = data.html_url
    let body = decode(data.content)
    return { path, body }
  }

  return { get: get }
}
