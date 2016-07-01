//@flow

import { Observable } from 'rxjs/Observable'
import 'rxjs/add/observable/from'
import 'rxjs/add/operator/debounceTime'
import 'rxjs/add/operator/filter'
import 'rxjs/add/operator/map'

import ObservableHistory from './observable.history'
import createHistory from 'history/lib/createBrowserHistory'

import Index from './Index'
import Page from './Page'

const history = ObservableHistory(createHistory())

Observable
  .from(history)
  //  .filter(exists)
  //  .map(fetch)
  .subscribe( path => console.log(path) )
