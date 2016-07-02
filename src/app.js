//@flow

import { Observable } from 'rxjs/Observable'
import 'rxjs/add/observable/from'
import 'rxjs/add/operator/do'
import 'rxjs/add/operator/filter'
import 'rxjs/add/operator/map'
import 'rxjs/add/operator/distinctUntilChanged'

import ObservableHistory from './observable.history'
import createHistory from 'history/lib/createBrowserHistory'

import Command from './Command'
import Index from './Index'
import Location from './Location'
import Page from './Page'

const history = ObservableHistory(createHistory())

const log = console.log.bind(console)
const next = log.bind("NEXT")
const error = log.bind("ERROR")
const done = log.bind("DONE")

import { decode } from 'base-64'
import 'rxjs/add/observable/dom/ajax'

//Observable
//  .ajax({
//    method: 'GET',
//    withCredentials: false,
//    url: `https://api.github.com/repos/tldr-pages/tldr-pages.github.io/contents/assets/index.json?ref=master`
//  })
//  .timeout(5000, new Error("Timeout :("))
//  .filter( res => res.status === 200 )
//  .pluck('response')
//  .pluck('content')
//  .map(decode)
//  .map(JSON.parse)
//  .mergeMap( index => index.commands )
//  .filter( cmd => cmd.name === "vim" )
//  .defaultIfEmpty(false)
//  .subscribe(next, error, done)

let State = Observable
  .from(history)
  .distinctUntilChanged()
  .map( (location) => ({
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
 )
  .subscribe(next, error, done)

// Subscribe to commands not being found
Observable.from(State)
  .filter( ({state, found}) => !found )
  .subscribe(next, error, done)
