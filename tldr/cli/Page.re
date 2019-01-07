open Model;

module Pp = {
  open Fmt;
  let name = string |> styled(`Bold);
  let desc = string;
  let example_desc = string |> styled(`Green);
  let example_gist = string |> styled(`Cyan);

  let pp: Page.t => string =
    page => {
      let b = Buffer.create(1024);
      let f = with_buffer(b);
      name(f, page.name);
      b |> Buffer.contents;
    };
};

let render: Page.t => unit =
  page => {
    Logs.app(m => m("%s", page |> Pp.pp));
  };
