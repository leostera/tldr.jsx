import Rx from 'rx';
import request from 'axios';
import moment from 'moment';
import { decode } from 'base-64';

const INDEX_URL = "https://api.github.com/repos/tldr-pages/tldr-pages.github.io/contents/assets/index.json";

// in-memory storage
let _commands;

let search = (name) => {
  return getIndex()
    .filter( byName(name) )
    .last( fallbackCommand()  );
};

let byName = (name) => {
  return (cmd) => cmd.name === name
}

let fallbackCommand = () =>  ({ platform: ["client"],
                                name: "not-found" })

let requestIndex = function *() {
  let response =  yield request(requestOptions());
  return response;
};

let requestOptions = () => {
  let opts = {
    method: 'GET',
    url: INDEX_URL,
    withCredentials: false
  };

  let modifiedSince = hasModifiedSince();
  if(modifiedSince) {
    opts.headers = {
      'If-Modified-Since': modifiedSince
    };
  }

  return opts;
}

let hasModifiedSince = () => {
  let expiry = localStorage.getItem("tldr/index.expiry");
  // Yes, that's right, it's the string "undefined"...gee.
  // So if it's truthy (not null, not undefined) it works
  if( expiry && expiry !== "undefined" ) {
    return expiry;
  } else {
    return false;
  }
}

let getIndex = () => {
  return Rx.Observable.spawn(requestIndex)
    .tap(cache)
    .flatMap(toCommands)
    .catch(localIndex)
};

let localIndex = (e) => {
  if( ! _commands ) {
    let raw = localStorage.getItem('tldr/index');
    _commands = JSON.parse(raw);
  }
  return Rx.Observable.fromArray(_commands);
};

let toCommands = (res) => {
  let hasData = res.status === 200;
  if (hasData) {
    return parse(res.data.content).commands;
  } else {
    throw new Error("Fallback to cache");
  }
};

let parse = (raw) => JSON.parse(decode(raw));

let cache = (res) => {
  let shouldCache = res.status === 200;
  if(shouldCache) {
    let ifModifiedSince = res.headers["last-modified"];
    localStorage.setItem("tldr/index.expiry", ifModifiedSince);
    let commands = JSON.stringify(parse(res.data.content).commands);
    localStorage.setItem("tldr/index", commands);
  }
}

// Public API
let Command = {
  search,
  getIndex
};

export { Command };

