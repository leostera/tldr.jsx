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

type app_params = {
  debug: bool,
};

type state = {
  index: list(command),
  meta: package,
  page: option(page),
  params: app_params,
};
