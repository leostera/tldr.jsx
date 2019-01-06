open Lwt.Infix;

let search = (_, name) => {
  Native.Index.create()
  >>= (
    result => {
      switch (result) {
      | Error(err) =>
        Logs_lwt.err(m => m("%s", Messages.index_create_error(err)))
      | Ok(index) =>
        index
        |> Native.Index.lookup(~name)
        >>= (
          cmd => {
            switch (cmd) {
            | None =>
              Logs_lwt.app(m => m("%s", Messages.command_not_found(name)))
            | Some(cmd) =>
              Logs_lwt.app(m => m("%s", Messages.command_found(cmd)))
            };
          }
        )
      };
    }
  )
  |> Lwt_main.run;
};
