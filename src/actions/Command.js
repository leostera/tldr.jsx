import Rx from 'rx';
import request from 'axios';
import moment from 'moment';

const INDEX_URL = "http://tldr-pages.github.io/assets/index.json";

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
  let _commands = JSON.parse(localStorage.getItem("tldr_index"));
  if(_commands && _commands.length > 0) {
    return Rx.Observable.fromArray(_commands);
  } else {
    return Rx.Observable.spawn(requestIndex).tap( (commands) => {
      localStorage.setItem("tldr_index", JSON.stringify(commands));
    }).flatMap( list => list )
  }
}

let Command = {
  search,
  getIndex
};

export { Command };
