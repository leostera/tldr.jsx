import Rx from 'rx';
import createHashHistory from 'history/lib/createHashHistory';

let history = createHashHistory();

export default function fromHistory () {

  let unlisten;
  let listen = handler =>
    unlisten = history.listen(handler);

  return Rx.Observable.fromEventPattern(listen, unlisten);
};
