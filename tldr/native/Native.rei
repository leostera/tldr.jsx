module Index: {
  type t;

  let create:
    unit =>
    Lwt_result.t(
      t,
      [>
        | `Connection_error(Httpaf.Client_connection.error)
        | `Empty_index
        | `Index_parse_error(exn)
        | `Parse_error(exn)
        | `Decoding_error(string)
        | `Reading_error
      ],
    );

  let lookup: (t, ~name: string) => Lwt.t(option(Model.Command.t));
};

module Page: {
  let for_command:
    Model.Command.t =>
    Lwt_result.t(
      Model.Page.t,
      [>
        | `Connection_error(Httpaf.Client_connection.error)
        | `Decoding_error(string)
        | `Invalid_page(list([> | `Missing_description | `Missing_title]))
        | `Parse_error(exn)
        | `Reading_error
        | `Something_went_wrong_while_parsing
      ],
    );
};
