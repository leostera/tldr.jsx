import Rx from 'rx';

export default function fromHistory (history) {
  let unlisten;
  let listen = handler =>
    unlisten = history.listen(handler);

  return Rx.Observable.fromEventPattern(listen, unlisten);
};
