//@flow

import { Observable } from 'rxjs/observable'

import request from 'axios'
import { decode } from 'base-64'

type Repository = {
  organization: string;
  name: string;
}

type Branch = 'master' | string

type Options = {
  repository: Repository;
  branch:     Branch;
}

type Github = {
  get(): Function;
}


type Get = {
  path: string,
  branch: string
}

type Method = 'GET' | 'POST' | 'PUT' | 'UPDATE'
type URL = string

type RequestOptions = {
  method?: RequestMethod,
  withCredentials?: boolean,
  url?: URL
}

export default (opts: Options): Github => {
  let { repository, branch } = opts

  const buildUrl = ({path, branch}: Get): string => {
    return `https://api.github.com/repos/${repo}/contents/${path}?ref=${branch}`
  }

  let get = ({path, branch}: Get): Response => {
    return Observable
      .spawn(requestPage(path))
      .timeout(1000, new Error('Timeout :( - Could not retrieve page') )
  }

  let requestPage = (cmd: Command): Generator => {
    let url = buildUrl(cmd)
    let opts: RequestOptions = requestOptions({url})
    return fetchPage(opts)
  }

  let buildUrl = (cmd: Command) => [toPath(cmd), BASE_BRANCH].join('?')
  let toPath   = (cmd: Command) => [BASE_URL, cmd.platform[0], cmd.name+'.md'].join('/')

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

}
