//@flow


import { Observable } from 'rxjs/Observable'
import 'rxjs/add/observable/from'
import 'rxjs/add/operator/do'
import 'rxjs/add/operator/filter'
import 'rxjs/add/operator/map'
import 'rxjs/add/operator/distinctUntilChanged'

import ObservableHistory from './observable.history'
import createHistory from 'history/lib/createBrowserHistory'

import Index from './Index'
import Location from './Location'
import Page from './Page'

import render from './components'

const __history = createHistory()
const history = ObservableHistory(__history)

const next  = console.log.bind(console,"NEXT")
const error = console.log.bind(console,"ERROR")
const done  = console.log.bind(console,"DONE")

let State = Observable
  .from(history)
  .distinctUntilChanged()
  .map( (location) => ({
    history: __history,
    index: Location.toIndex(location),
    command: Location.toCommand(location)
  }))
  .mergeMap( state => Index(state.index).search(state.command.name)
          , (state, found) => ({state, found}))

// Subscribe to commands found and fetch them
Observable.from(State)
  .filter( ({state, found}) => found )
  .mergeMap( ({state, found}) =>
    Page({
      branch: state.index.branch,
      repository: 'tldr-pages/tldr',
      timeout: 5000
    }).get(state.command)
  , ({state, found}, page) => ({state, found, page})
  )
  .subscribe(render, error, done)

// Subscribe to commands not being found
Observable.from(State)
  .filter( ({state, found}) => !found )
  .subscribe(render, error, done)
