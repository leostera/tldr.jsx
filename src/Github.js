//@flow

/*******************************************************************************
 * Imports
 *******************************************************************************/

import { Observable } from 'rxjs/observable'
import type { AjaxObservable } from 'rxjs/observable/dom/ajax'
import { ajax } from 'rxjs/observable/dom/ajax'
Observable.ajax = ajax
import 'rxjs/add/operator/timeout'

/*******************************************************************************
 * Type Definitions
 *******************************************************************************/

type Repository = string

type Branch = 'master' | string

export type Options = {
  repository: Repository;
  branch?: string;
}

export type Github = {
  get(opts: Get): AjaxObservable
}

export type Get = {
  path: string;
  branch?: string;
}

/*******************************************************************************
 * Public API
 *******************************************************************************/

export default (opts: Options): Github => {
  let { repository } = opts

  const buildUrl = ({path, branch}: Get): string => (
    `https://api.github.com/repos/${repository}/contents/${path}?ref=${branch}`
  )

  let get = (opts: Get): AjaxObservable => {
    return Observable
      .ajax({ url: buildUrl(opts) })
      .timeout(1000, new Error('Timeout :(') )
  }

  return { get: get }
}
