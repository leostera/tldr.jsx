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
import type { Page as PageType } from './Page'

import render from './render'

/*******************************************************************************
 * Private
 *******************************************************************************/

const __history: History = createHistory()
const history: Observable = ObservableHistory(__history)

const log  = (...args: any[]): void => {
  console.log((new Date()).toTimeString().split(' ')[0], ...args)
}
const error: Function = log.bind("ERROR")
const done:  Function = log.bind("DONE")

let ga: Function = window.ga
const track = (location: HistoryLocation): void => {
  if ( ga && typeof ga === 'function' ) {
    ga('set', 'page', location.pathname)
    ga('send', 'pageview')
  }
}

// Extend state
const addFound = (state: StateType, found: boolean): StateType => ({...state, found})
const addPage  = (state: StateType, page: PageType): StateType => ({...state, page})

// Filters
const byFound    = ({params, found}: StateType): boolean => !found
const byNotFound = ({params, found}: StateType): boolean => !!!found

// Merge Mappers
const findInIndex = ({params}: StateType): Observable =>
  Index(params.index).search(params.command)

const buildState = ({params, found}: StateType): Observable => (
  Page({
    branch: params.index.branch,
    repository: 'tldr-pages/tldr',
    timeout: 5000
  }).get(params.command)
)

const buildInitialState = (location: HistoryLocation): StateType => ({
  params: {
    history: __history,
    index: Location.toIndex(location),
    command: Location.toCommand(location),
    debug: Location.isDebugging(location)
  }
})


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
Observable
  .from(StateFromIndex)
  .filter(byFound)
  .mergeMap(buildState, addPage)
  .do(render)
  .subscribe(log, error, done)

// Subscribe to commands not being found
Observable
  .from(StateFromIndex)
  .filter(byNotFound)
  .do(render)
  .subscribe(log, error, done)
