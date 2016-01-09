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

  let modifiedSince = localStorage.getItem("tldr/index.cache");
  // Yes, that's right, it's the string "undefined"...gee.
  if(modifiedSince !== "undefined" && modifiedSince !== undefined) {
    requestOptions.headers = {
      'If-Modified-Since': modifiedSince
    };
  }

  let response = yield request(requestOptions);
  return response;
};

let getIndex = () => {
  return Rx.Observable.spawn(requestIndex).tap( (response) => {
      let ifModifiedSince = response.headers["last-modified"];
      localStorage.setItem("tldr/index.cache", ifModifiedSince);
      let commands = response.data.commands;
      localStorage.setItem("tldr/index", JSON.stringify(commands));
  }).flatMap( res => res.data.commands )
}

let Command = {
  search,
  getIndex
};

export { Command };

