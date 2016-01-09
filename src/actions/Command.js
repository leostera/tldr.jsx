import Rx from 'rx';
import request from 'axios';

const INDEX_URL = "http://tldr-pages.github.io/assets/index.json";

let _commands = [];

let search = (name) => {
  return getIndex()
    .filter( cmd => {
      return cmd.name === name
    })
    .last( { platform: ["client"], name: "not-found" } );
};

let requestIndex = function *() {
  let requestOptions = {
    method: 'GET',
    url: INDEX_URL,
    withCredentials: false
  };
  let index = yield request(requestOptions);
  let commands = index.data.commands || [];
  return commands;
};

let getIndex = () => {
  if(_commands.length === 0) {
    return Rx.Observable.spawn(requestIndex).tap( (commands) => {
      _commands = commands;
    }).flatMap( list => list )
  } else {
    return Rx.Observable.fromArray(_commands);
  }
}

let Command = {
  search,
  getIndex
};

export { Command };
