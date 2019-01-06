open Model;

let command_found: Command.t => string =
  cmd =>
    Printf.sprintf(
      "Name: \"%s\" ; Platform \"%s\".",
      cmd.name,
      cmd.platform |> Platform.to_string,
    );

let command_not_found = name =>
  Printf.sprintf(
    "Could not find command \"%s\" for platforms \"%s\".",
    name,
    Platform.platforms |> List.map(Platform.to_string) |> String.concat(", "),
  );

let connection_error_to_string =
  fun
  | `Exn(exn) => Printexc.to_string(exn)
  | `Invalid_response_body_length(_res) => "Invalid Response Body Length"
  | `Malformed_response(str) => "Malformed Response: " ++ str;

let create_error_to_string =
  fun
  | `Empty_index => "The index we built had no commands."
  | `Connection_error(err) =>
    Printf.sprintf(
      "There was a connection error when fetching the index file. (%s)",
      connection_error_to_string(err),
    )
  | `Reading_error => "There was a problem reading the response from Github."
  | `Index_parse_error(exn) =>
    Printf.sprintf(
      "We could not parse the index file (%s)",
      Printexc.to_string(exn),
    )
  | `Decoding_error(str) => Printf.sprintf("We could not decode: %s", str)
  | `Parse_error(exn) =>
    Printf.sprintf(
      "We could not parse something (%s)",
      Printexc.to_string(exn),
    );

let index_create_error = err =>
  Printf.sprintf(
    "Something went wrong when creating the index of commands: %s",
    create_error_to_string(err),
  );
