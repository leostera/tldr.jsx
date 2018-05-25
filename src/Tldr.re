open Option_monad;

type package = {
  revision: string,
  version: string,
};

type command = {
  name: string,
  platform: string,
};

type page = {
  body: string,
  cmd: command,
  path: string,
};

type app_params = {debug: bool};

type state = {
  index: list(command),
  meta: package,
  page: option(page),
  params: app_params,
};

let a = {name: "some_command", platform: "some_platform"};

Js.Json.stringifyAny([a, a, a]) >>| LocalStorage.set("hello");

Js.Json.stringifyAny([a, a, a]) >>| LocalStorage.set("hello_2");

LocalStorage.get("hello") >>| Js.Json.parseExn >>| Js.log;

open Result_monad;

LocalStorage.remove("hello") >>| Js.log;
