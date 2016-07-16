//@flow

/*******************************************************************************
 * Imports
 *******************************************************************************/

import { fromEventPattern } from 'rxjs/observable/fromEventPattern'
import 'rxjs/add/operator/startWith'

import type { Observable } from 'rxjs/Observable'
import type { History, Location } from 'history'

/*******************************************************************************
 * Public API
 *******************************************************************************/

export default (history: History): Observable => {
  let unlisten: Function
  let listen = (handler: Function): any =>
    unlisten = history.listen(handler)

  let currentLocation: Location = history.getCurrentLocation()

  return fromEventPattern(listen, unlisten)
    .startWith(currentLocation)
}
