open Model;

module Pp = {
  open Fmt;
  let name = string |> styled(`Bold);
  let desc = string;
  let example_desc = string |> styled(`Green);
  let example_gist = string |> styled(`Cyan);
  let newline = f => pf(f, "\n");
  let tab = f => pf(f, "\t");

  let pp: Page.t => string =
    page => {
      let b = Buffer.create(1024);
      let f = with_buffer(b);
      set_style_renderer(f, `Ansi_tty);
      name(f, page.name);
      newline(f);
      newline(f);
      desc(f, page.description);
      newline(f);
      page.examples
      |> List.iter((e: Page.example) => {
           example_desc(f, e.description);
           newline(f);
           tab(f);
           example_gist(f, e.gist);
           newline(f);
           newline(f);
         });
      b |> Buffer.contents;
    };
};

let render: Page.t => unit =
  page => {
    Logs.app(m => m("%s", page |> Pp.pp));
  };
