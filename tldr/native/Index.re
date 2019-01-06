module IndexTbl =
  Hashtbl.Make({
    type t = Model.Command.name;
    let equal = String.equal;
    let hash = Hashtbl.hash;
  });

type t = IndexTbl.t(Model.Command.t);

module Key = {
  type t = string;
  let make: Model.Command.t => t =
    command =>
      (command.platform |> Model.Platform.to_string) ++ "/" ++ command.name;
};

module Parsers = {
  let parse_command = json => {
    switch (
      {
        open Yojson.Basic;
        let name = json |> Util.member("name") |> Util.to_string;
        json
        |> Util.member("platform")
        |> Util.to_list
        |> List.map(Util.to_string)
        |> List.fold_left(
             (acc, platform_name) =>
               switch (Model.Platform.of_string(platform_name)) {
               | None => acc
               | Some(platform) => [{Model.Command.name, platform}, ...acc]
               },
             [],
           );
      }
    ) {
    | exception e => Error(`Command_parse_error(e))
    | cmd => Ok(cmd)
    };
  };

  let parse_index = json => {
    switch (
      {
        Yojson.Basic.(
          json
          |> from_string
          |> Util.member("commands")
          |> Util.to_list
          |> List.map(parse_command)
        );
      }
    ) {
    | exception e => Lwt_result.fail(`Index_parse_error(e))
    | [] => Lwt_result.fail(`Empty_index)
    | commands =>
      let make_hash_pairs = command => (Key.make(command), command);

      let table_entries =
        List.fold_left(
          (acc, c) =>
            switch (c) {
            | Ok(cs) => [cs |> List.map(make_hash_pairs), acc] |> List.concat
            | Error(_) => acc
            },
          [],
          commands,
        );

      let table = IndexTbl.create(table_entries |> List.length);

      List.iter(
        ((key, command)) => IndexTbl.add(table, key, command),
        table_entries,
      );

      Lwt_result.return(table);
    };
  };
};

let create = () => {
  Lwt_result.Infix.(
    Github_lwt.Repo.file(
      ~api=Github.API.v3,
      ~path="assets/index.json",
      ~gitref="master",
      Github.Repo.make(~owner="tldr-pages", ~name="tldr-pages.github.io"),
    )
    >>= Github_lwt.File.content
    >>= Parsers.parse_index
  );
};

let lookup: (t, ~name: string) => _ =
  (index, ~name) => {
    Model.Platform.platforms
    |> List.map(platform => {Model.Command.name, platform})
    |> List.map(Key.make)
    |> List.map(IndexTbl.find_opt(index))
    |> List.fold_left(
         (acc, c) =>
           switch (acc) {
           | Some(_) => acc
           | None =>
             switch (c) {
             | Some(command) => Some(command)
             | None => acc
             }
           },
         None,
       )
    |> Lwt.return;
  };

let page_for_command = _command => Lwt_result.fail(`Not_found);
