//@flow

import { Observable } from 'rxjs/observable'
import 'rxjs/add/observable/fromEventPattern'

declare class History {
  listen: Function
}

const history = (history: History): Observable => {
  let unlisten
  let listen = (handler: Function): any =>
    unlisten = history.listen(handler)

  return Observable.fromEventPattern(listen, unlisten)
}

Observable.history = history
