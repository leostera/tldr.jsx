let parse = str => {
  switch (
    Yojson.(
      str
      |> Basic.from_string
      |> Basic.Util.member("content")
      |> Basic.Util.to_string
    )
  ) {
  | exception e => Lwt_result.fail(`Parse_error(e))
  | content => {Github.File.content: content} |> Lwt_result.return
  };
};

let content = repo => {
  switch (Github.File.(repo.content) |> B64.decode) {
  | exception e => Lwt_result.fail(`Parse_error(e))
  | json => Lwt_result.return(json)
  };
};
