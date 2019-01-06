module IndexTbl =
  Hashtbl.Make({
    type t = Model.Command.name;
    let equal = String.equal;
    let hash = Hashtbl.hash;
  });

module Key = {
  type t = string;
  let make = (~name: Model.Command.name, ~platform: Model.Command.platform) =>
    platform ++ "/" ++ name;
};

let parse_command: Yojson.Basic.json => result(Model.Command.t, _) =
  json => {
    switch (
      {
        open Yojson.Basic;
        let name = json |> Util.member("name") |> Util.to_string;
        let platforms =
          json
          |> Util.member("platform")
          |> Util.to_list
          |> List.map(Util.to_string);
        {Model.Command.name, platforms};
      }
    ) {
    | exception e => Error(`Command_parse_error(e))
    | cmd => Ok(cmd)
    };
  };

let parse_index: string => Lwt_result.t(IndexTbl.t(Model.Command.t), _) =
  json => {
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
      let make_hash_pairs: Model.Command.t => list((string, Model.Command.t)) = (
        command => {
          command.platforms
          |> List.map(p =>
               (Key.make(~platform=p, ~name=command.name), command)
             );
        }
      );

      let table_entries =
        List.fold_left(
          (acc, c) =>
            switch (c) {
            | Ok(c) => List.concat([make_hash_pairs(c), acc])
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

let create = () => {
  Lwt_result.Infix.(
    Github_lwt.Repo.file(
      ~api=Github.API.v3,
      ~path="assets/index.json",
      ~gitref="master",
      Github.Repo.make(~owner="tldr-pages", ~name="tldr"),
    )
    >>= Github_lwt.File.content
    >>= parse_index
  );
};

let lookup = (index, ~name, ~platform) => {
  Key.make(~name, ~platform) |> IndexTbl.find_opt(index) |> Lwt.return;
};

let page_for_command = _command => Lwt_result.fail(`Not_found);
