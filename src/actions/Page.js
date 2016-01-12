import Rx from 'rx';
import request from 'axios';
import { decode } from 'base-64';

const BASE_URL = "https://api.github.com/repos/tldr-pages/tldr/contents/pages";

let get = (cmd) => {
  return Rx.Observable
    .spawn(requestPage(cmd))
    .timeout(1000, new Error('Timeout :( - Could not retrieve page') )
}

let requestPage = (cmd) => {
  let url = buildUrl(cmd);
  let opts = requestOptions({url});
  return fetchPage(opts);
}

let buildUrl = (cmd) => [BASE_URL, cmd.platform[0], cmd.name+'.md'].join('/')

let requestOptions = (opts) => {
  return Object.assign({
    method: 'GET',
    withCredentials: false
  }, opts);
}

let fetchPage = function *(opts) {
  let {data: {content}} = yield request(opts);
  return decode(content);
}

let Page = {
  get
};

export { Page };
