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
              Logs.debug(m => m("%s", Messages.command_found(cmd)));
              Native.Page.for_command(cmd)
              >>= (
                result => {
                  switch (result) {
                  | Ok(page) => Page.render(page) |> Lwt.return
                  | Error(err) =>
                    Logs_lwt.err(m =>
                      m("%s", Messages.create_error_to_string(err))
                    )
                  };
                }
              );
            };
          }
        )
      };
    }
  )
  |> Lwt_main.run;
};
