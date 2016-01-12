import Rx from 'rx';
import request from 'axios';
import moment from 'moment';

const INDEX_URL = "http://tldr-pages.github.io/assets/index.json";

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
  let response = yield request(requestOptions());
  if(response.status === 0) {
    throw response;
  }
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
  let hasData = typeof res.data === "object";
  if (hasData && res.data.commands) {
    return res.data.commands;
  } else {
    return res;
  }
};

let cache = (response) => {
  if(response && response.headers && response.data ) {
    let ifModifiedSince = response.headers["last-modified"];
    localStorage.setItem("tldr/index.expiry", ifModifiedSince);
    let commands = JSON.stringify(response.data.commands);
    localStorage.setItem("tldr/index", commands);
  }
}

// Public API
let Command = {
  search,
  getIndex
};

export { Command };

