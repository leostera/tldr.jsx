open Lwt.Infix;

/** Setup loggers */
Fmt_tty.setup_std_outputs();
Logs.set_level(Some(Logs.Debug));
Logs.set_reporter(Logs_fmt.reporter());

let find = (name, platform) => {
  Native.Index.create()
  >>= (
    result => {
      switch (result) {
      | Error(err) =>
        Logs_lwt.err(m => m("%s", Messages.index_create_error(err)))
      | Ok(index) =>
        index
        |> Native.Index.lookup(~name, ~platform)
        >>= (
          cmd => {
            switch (cmd) {
            | None =>
              Logs_lwt.app(m =>
                m("%s", Messages.command_not_found(name, platform))
              )
            | Some(cmd) =>
              Logs_lwt.app(m => m("%s", Messages.command_found(cmd)))
            };
          }
        )
      };
    }
  );
};

find("tldr", "common") |> Lwt_main.run;
