//@flow


import { Observable } from 'rxjs/Observable'
import 'rxjs/add/observable/from'
import 'rxjs/add/operator/catch'
import 'rxjs/add/operator/debounceTime'
import 'rxjs/add/operator/distinctUntilChanged'
import 'rxjs/add/operator/do'
import 'rxjs/add/operator/filter'
import 'rxjs/add/operator/map'
import 'rxjs/add/operator/takeUntil'

import ObservableHistory from './observable.history'
import createHistory from 'history/lib/createBrowserHistory'

import Index from './Index'
import Location from './Location'
import Page from './Page'

import render from './render'

const __history = createHistory()
const history = ObservableHistory(__history)

const log  = (...args) => {
  console.log((new Date()).toTimeString().split(' ')[0], ...args)
}
const error = log.bind("ERROR")
const done  = log.bind("DONE")

let ga = window.ga
const track = (location) => {
  if ( ga && typeof ga === 'function' ) {
    ga('set', 'page', location.pathname)
    ga('send', 'pageview')
  }
}

let State = Observable
  .from(history)
  .debounceTime(300)
  .distinctUntilChanged()
  .do(track)
  .map( (location) => ({
    state: {
      history: __history,
      index: Location.toIndex(location),
      command: Location.toCommand(location),
      debug: Location.isDebugging(location)
    }
  }))
  .do(render)

let StateFromIndex = Observable
  .from(State)
  .mergeMap( ({state}) => Index(state.index)
                           .search(state.command)
          , ({state}, found) => ({state, found}))
  .do(log)
  .distinctUntilChanged()

// Subscribe to commands found and fetch them
Observable
  .from(StateFromIndex)
  .filter( ({state, found}) => found )
  .mergeMap( ({state, found}) =>
    Page({
      branch: state.index.branch,
      repository: 'tldr-pages/tldr',
      timeout: 5000
    }).get(state.command)
  , ({state, found}, page) => ({state, found, page})
  )
  .do(render)
  .subscribe(log, error, done)

// Subscribe to commands not being found
Observable
  .from(StateFromIndex)
  .filter( ({state, found}) => !found )
  .do(render)
  .subscribe(log, error, done)
