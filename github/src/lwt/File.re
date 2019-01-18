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
  let data =
    Github.File.(repo.content)
    |> String.split_on_char('\n')
    |> String.concat("");
  switch (data |> B64.decode_opt) {
  | None => Lwt_result.fail(`Decoding_error(repo.content))
  | Some(data) => Lwt_result.return(data)
  };
};
