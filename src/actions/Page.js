//@flow


import type { Page, Command } from '../app'

import { Observable } from 'rxjs/observable'

import request from 'axios'
import { decode } from 'base-64'

import { parse } from 'query-string'

let repo = "tldr-pages/tldr"
let branch = "master"
let query = parse(location.search)

if (query.repo)
  repo = query.repo
const BASE_URL = `https://api.github.com/repos/${repo}/contents/pages`

if (query.branch)
  branch = query.branch
const BASE_BRANCH = `ref=${branch}`

let fetch = (cmd: Command): Page => {
  return Observable
    .spawn(requestPage(cmd))
    .timeout(1000, new Error('Timeout :( - Could not retrieve page') )
}

let requestPage = (cmd: Command): Generator => {
  let url = buildUrl(cmd)
  let opts: RequestOptions = requestOptions({url})
  return fetchPage(opts)
}

let buildUrl = (cmd: Command) => [toPath(cmd), BASE_BRANCH].join('?')
let toPath   = (cmd: Command) => [BASE_URL, cmd.platform[0], cmd.name+'.md'].join('/')

type RequestMethod = 'GET' | 'POST' | 'PUT' | 'UPDATE'
type URL = string

type RequestOptions = {
  method?: RequestMethod,
  withCredentials?: boolean,
  url?: URL
}

const requestDefaults = (): RequestOptions => ({
  method: 'GET',
  withCredentials: false
})

let requestOptions = (opts: RequestOptions): RequestOptions => {
  return Object.assign(requestDefaults, opts)
}

let fetchPage = function *(opts): Generator {
  let response = yield request(opts) || false
  if(response) {
    return {
      path: response.data.html_url,
      body: decode(response.data.content)
    }
  }
}

export default { fetch }
