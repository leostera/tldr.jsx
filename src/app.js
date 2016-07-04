//@flow

/*******************************************************************************
 * Imports
 *******************************************************************************/

import { Observable } from 'rxjs/Observable'
import 'rxjs/add/observable/from'
import 'rxjs/add/operator/catch'
import 'rxjs/add/operator/debounceTime'
import 'rxjs/add/operator/distinctUntilChanged'
import 'rxjs/add/operator/do'
import 'rxjs/add/operator/filter'
import 'rxjs/add/operator/map'
import 'rxjs/add/operator/takeUntil'

import type { History, Location as HistoryLocation } from 'history'
import type { State } from './Tldr'

import ObservableHistory from './lib/observable.history'
import createHistory from 'history/lib/createBrowserHistory'

import Index from './Index'
import Location from './Location'
import Page from './Page'

import type { State as StateType } from './Tldr'
import type { Page as PageType, Options as PageOptions } from './Page'

import render from './render'

/*******************************************************************************
 * Private
 *******************************************************************************/

let __history: History = createHistory()
let history: Observable = ObservableHistory(__history)

let log  = (...args: any[]): void => {
  console.log((new Date()).toTimeString().split(' ')[0], ...args)
}
let error: Function = log.bind("ERROR")
let done:  Function = log.bind("DONE")

let ga: Function = window.ga
let track = (location: HistoryLocation): void => {
  if ( ga && typeof ga === 'function' ) {
    ga('set', 'page', location.pathname)
    ga('send', 'pageview')
  }
}

// Extend state
let addFound = (state: StateType, found: boolean): StateType => ({...state, found}: StateType)
let addPage  = (state: StateType, page: PageType): StateType => {
  log(state, page)
  return {...state, page}
}

// Filters
let byFound    = ({params, found}: StateType): mixed   => found
let byNotFound = ({params, found}: StateType): boolean => !found

// Merge Mappers
let findInIndex = ({params}: StateType): Observable =>
  Index(params.index).search(params.command)

let buildState = ({params, found}: StateType): Observable => {
  let options: PageOptions = {
    branch: params.index.branch,
    repository: 'tldr-pages/tldr',
    timeout: 5000
  }
  return Page(options).get(params.command)
}

let buildInitialState = (location: HistoryLocation): StateType => ({
  params: {
    history: __history,
    index: Location.toIndex(location),
    command: Location.toCommand(location),
    debug: Location.isDebugging(location)
  }
}: StateType)


/*******************************************************************************
 * Public API
 *******************************************************************************/

let StateObservable: Observable = Observable
  .from(history)
  .debounceTime(300)
  .distinctUntilChanged()
  .do(track)
  .map(buildInitialState)
  .do(render)

let StateFromIndex: Observable = Observable
  .from(StateObservable)
  .mergeMap(findInIndex, addFound)
  .distinctUntilChanged()

// Subscribe to commands found and fetch them
let CommandFound: Observable = Observable
  .from(StateFromIndex)
  .do(log)
  .filter(byFound)
  .do(log)
  .mergeMap(buildState, addPage)
  .do(log)
  .do(render)
  .subscribe(log, error, done)

// Subscribe to commands not being found
let CommandNotFound: Observable = Observable
  .from(StateFromIndex)
  .filter(byNotFound)
  .do(render)
  .subscribe(log, error, done)
