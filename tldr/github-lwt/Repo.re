open Lwt_result.Infix;

let file = (~api, ~path, ~gitref, repo) => {
  let url =
    Github.API.(
      api.base_url
      ++ "repos/"
      ++ Github.Repo.(repo.owner ++ "/" ++ repo.name)
      ++ "/contents/"
      ++ path
    );
  Logs.debug(m => m("Github_lwt.Repo.file: %s", url));
  Httpkit_lwt.Client.(
    Httpkit.Client.Request.create(
      ~headers=[("User-Agent", "tldr-cli")],
      `GET,
      Uri.add_query_param'(url |> Uri.of_string, ("ref", gitref)),
    )
    |> Https.send
    >>= Response.body
    >>= File.parse
  );
};
