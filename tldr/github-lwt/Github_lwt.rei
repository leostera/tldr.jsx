module Repo: {
  let file:
    (~api: Github.API.t, ~path: string, ~gitref: string, Github.Repo.t) =>
    Lwt_result.t(
      Github.File.t,
      [>
        | `Connection_error(Httpaf.Client_connection.error)
        | `Parse_error(exn)
        | `Reading_error
      ],
    );
};

module File: {
  let parse: string => Lwt_result.t(Github.File.t, [> | `Parse_error(exn)]);

  let content:
    Github.File.t => Lwt_result.t(string, [> | `Parse_error(exn)]);
};
