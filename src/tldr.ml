type package = {
  version:  string;
  revision: string;
}

type meta_state = {
  pkg: package;
  debug: bool;
}

type state = {
  meta: meta_state;
  window: Window.window;
  found: bool;
  current_index: Index.index;
  current_cmd: Index.command;
  current_page: Page.page;
}
