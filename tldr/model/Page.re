type example = {
  description: string,
  gist: string,
};

type t = {
  /** The contents of a page. */
  name: string,
  description: string,
  examples: list(example),
};

module Parser = {
  type t = [
    | `Title(string)
    | `Desc(string)
    | `Example_desc(string)
    | `Example_gist(string)
    | `EOF
  ];

  let to_string =
    fun
    | `Title(s) => "`Title(" ++ s ++ ")"
    | `Desc(s) => "`Desc(" ++ s ++ ")"
    | `Example_desc(s) => "`Example_desc(" ++ s ++ ")"
    | `Example_gist(s) => "`Example_gist(" ++ s ++ ")"
    | `EOF => "EOF";

  let of_string = str => {
    let lexbuf = Lexing.from_string(str);
    let rec parse = (acc, token) => {
      switch (token) {
      | `EOF => acc |> List.rev
      | x => parse([x, ...acc], Page_lexer.token(lexbuf))
      };
    };
    let tokens = parse([], Page_lexer.token(lexbuf));

    let title =
      List.find_opt(
        fun
        | `Title(_) => true
        | _ => false,
        tokens,
      );

    let description =
      List.find_opt(
        fun
        | `Desc(_) => true
        | _ => false,
        tokens,
      );

    let examples =
      tokens
      |> List.filter(
           fun
           | `Example_desc(_)
           | `Example_gist(_) => true
           | _ => false,
         )
      |> List.partition(
           fun
           | `Example_desc(_) => true
           | _ => false,
         )
      |> (((a, b)) => List.combine(a, b))
      |> List.fold_left(
           (acc, pair) =>
             switch (pair) {
             | (`Example_desc(desc), `Example_gist(gist)) => [
                 {description: desc, gist},
                 ...acc,
               ]
             | _ => acc
             },
           [],
         );

    switch (title, description) {
    | (Some(`Title(t)), Some(`Desc(d))) =>
      Ok({name: t, description: d, examples})
    | (None, None) =>
      Error(`Invalid_page([`Missing_title, `Missing_description]))
    | (None, _) => Error(`Invalid_page([`Missing_title]))
    | (_, None) => Error(`Invalid_page([`Missing_description]))
    | (_, _) => Error(`Something_went_wrong_while_parsing)
    };
  };
};
