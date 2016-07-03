//@flow

import type { Observable } from 'rxjs/observable'
import { fromEventPattern } from 'rxjs/observable/fromEventPattern'
import 'rxjs/add/operator/startWith'

type Action = 'POP' | 'PUSH' | 'REPLACE'

export type Location = {
  pathname: string;
  search?:  string;
  hash?:    string;
  state?:   Object;
  action?:  Action;
}

declare type History = {
  listen: Function;
  getCurrentLocation: Function;
}

export default (history: History): Observable => {
  let unlisten
  let listen = (handler: Function): any =>
    unlisten = history.listen(handler)

  let currentLocation = history.getCurrentLocation()

  return fromEventPattern(listen, unlisten)
    .startWith(currentLocation)
}
