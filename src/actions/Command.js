import Rx from 'rx';
import request from 'axios';

const INDEX_URL = "http://tldr-pages.github.io/assets/index.json";

let search = (name) => {
  return getIndex()
    .timeout(1000, new Error('Timeout :( – Could not retrieve index') )
    .flatMap( list => list )
    .filter( cmd => {
      return cmd.name === name
    });
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

let getIndex = () => Rx.Observable.spawn(requestIndex)

let Command = {
  search,
  getIndex
};

export { Command };
