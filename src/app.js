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

let State = Observable
  .from(history)
  .distinctUntilChanged()
  .map( (location) => Object.assign(
    {},
    {index: Location.toIndex(location)},
    {command: Location.toCommand(location)}
  ))
  .mergeMap( spec =>
    Page({ branch: spec.index.branch, repository: 'tldr-pages/tldr' })
      .get(spec.command)
  )
  .subscribe(log)

