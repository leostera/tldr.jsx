//@flow

/*******************************************************************************
 * Imports
 *******************************************************************************/

import { encode } from 'base-64'

import { Observable } from 'rxjs/Observable'

import type { AjaxObservable, AjaxRequest } from 'rxjs/observable/dom/ajax'

import { of as staticOf } from 'rxjs/observable/of'
Observable.of = staticOf

import { ajax } from 'rxjs/observable/dom/ajax'
import 'rxjs/add/operator/catch'

/*******************************************************************************
 * Type Definitions
 *******************************************************************************/

type Repository = string

type Branch = 'master' | string

type Timeout = number

export type Options = {
  repository: Repository;
  branch?: Branch;
  timeout?: Timeout
}

export type Github = {
  get(opts: Get): AjaxObservable
}

export type Get = {
  path: string;
  branch?: string;
}


let _lastModified = false

/*******************************************************************************
 * Public API
 *******************************************************************************/

export default (opts: Options): Github => {
  let { repository, timeout } = opts

  let buildUrl = ({path, branch}: Get): string => (
    `https://api.github.com/repos/${repository}/contents/${path}?ref=${branch}`
  )

  let requestDefaults = (): AjaxRequest => ({
    method: 'GET',
    withCredentials: false,
    timeout: 10000,
    headers: {
    }
  })

  let defaults = (overrides: AjaxRequest): AjaxRequest => Object.assign(requestDefaults(), overrides)

  let saveLastModified = res => _lastModified = res.xhr.getResponseHeader('last-modified')

  let get = (opts: Get): AjaxObservable => {

    return ajax(defaults({ url: buildUrl(opts) }))
        .do(saveLastModified)
        .catch( (exception) => Observable.of(exception) )
  }

  return { get: get }
}
