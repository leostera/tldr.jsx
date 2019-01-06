open Cmdliner;

let setup_verbosity = (level, debug) => {
  Fmt_tty.setup_std_outputs();
  if (debug) {
    Logs.set_level(Some(Logs.Debug));
  } else {
    Logs.set_level(level);
  };
  Logs.set_reporter(Logs_fmt.reporter());
};

module Args = {
  let debug = {
    let doc = "Shortcut for debugging verbosity";
    Arg.(value & flag & info(["d", "debug"], ~doc));
  };

  let verbosity = Term.(const(setup_verbosity) $ Logs_cli.level() $ debug);

  let cmd = {
    let doc = "Command that we're searching for";
    Arg.(value & pos(0, string, "tldr") & info([], ~docv="CMD", ~doc));
  };
};

let cmd = Term.(const(Tldr.search) $ Args.verbosity $ Args.cmd);

Term.eval((cmd, Term.info("tldr"))) |> Term.exit;
