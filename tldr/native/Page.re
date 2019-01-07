open Lwt_result.Infix;
open Model;

let for_command: Command.t => _ =
  command => {
    let path =
      Printf.sprintf(
        "pages/%s/%s.md",
        command.platform |> Platform.to_string,
        command.name,
      );

    Github_lwt.Repo.file(
      ~api=Github.API.v3,
      ~path,
      ~gitref="master",
      Model.data_repo,
    )
    >>= Github_lwt.File.content
    >>= (str => str |> Page.Parser.of_string |> Lwt_result.lift);
  };
