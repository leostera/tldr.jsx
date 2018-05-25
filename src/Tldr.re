module Tldr = {
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
    index: option(list(command)),
    meta: package,
    page: option(page),
    params: app_params,
  };
  type action =
    | Bootstrap;
};

let initialState: Tldr.state = {
  index: None,
  page: None,
  meta: {
    revision: "asd123c",
    version: "1",
  },
  params: {
    debug: true,
  },
};

let reducer = (~state, ~action) => state;

let app: App.t(Tldr.state, Tldr.action) = {
  initialAction: Bootstrap(initialState),
  effects: [],
  reducer,
  initialState,
};

App.run(app);
