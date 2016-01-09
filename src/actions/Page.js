import Rx from 'rx';
import request from 'axios';
import { decode } from 'base-64';

const BASE_URL = "https://api.github.com/repos/tldr-pages/tldr/contents/pages";

let get = (cmd) => {
  return Rx.Observable
    .spawn(requestPage(cmd))
    .timeout(1000, new Error('Timeout :( - Could not retrieve page') )
}


let buildUrl = (cmd) => [BASE_URL, cmd.platform[0], cmd.name+'.md'].join('/')

let requestPage = (cmd) => {
  return function *() {
    let requestOptions = {
      method: 'GET',
      url: buildUrl(cmd),
      withCredentials: false
    };
    let rawIndex = yield request(requestOptions);
    let body = decode(rawIndex.data.content);
    return body;
  }
}

let Page = {
  get
};

export { Page };
