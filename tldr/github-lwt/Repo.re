open Lwt_result.Infix;

let file = (~api, ~path, ~gitref, repo) => {
  let url =
    Github.API.(
      api.base_url
      ++ "/"
      ++ Github.Repo.(repo.owner ++ "/" ++ repo.name)
      ++ "/contents/"
      ++ path
    );
  Httpkit_lwt.Client.(
    Uri.add_query_param'(url |> Uri.of_string, ("ref", gitref))
    |> Https.send
    >>= Response.body
    >>= File.parse
  );
};
