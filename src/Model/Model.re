/*
  Package information including the revision and the version. Useful
  for identification purposes (like sending this to Sentry or other
  error loggers).
 */
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
  | Unchanged
  | Bootstrap(state);

print_string("Hello world");
