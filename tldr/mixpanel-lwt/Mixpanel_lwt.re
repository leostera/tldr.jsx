open Lwt_result.Infix;

module Event = {
  /**
    {
      "event": "Level Complete",
      "properties": {
        "Level Number": 9,
        "distinct_id": "13793",
        "token": "e3bc4100330c35722740fb8c6f5abddc",
        "time": 1358208000,
        "ip": "203.0.113.9"
      }
    }
*/
  let to_json: Mixpanel.Event.t => string =
    event => {
      Yojson.Basic.from_string(
        "{ \"event\": \""
        ++ (event |> Mixpanel.Event.name)
        ++ "\", \"properties\": {"
        ++ (
          event
          |> Mixpanel.Event.properties
          |> List.map(((k, v)) => "\"" ++ k ++ "\": \"" ++ v ++ "\"")
          |> String.concat(", ")
        )
        ++ "} }",
      )
      |> Yojson.Basic.to_string;
    };
};

module Tracking = {
  let track: (~api: Mixpanel.API.t, Mixpanel.Event.t) => Lwt_result.t(unit, _) =
    (~api, event) => {
      let queryparams = ("data", Event.to_json(event) |> B64.encode);
      let body = "";
      let url = Mixpanel.API.(api.base_url ++ "/track/");
      Httpkit_lwt.Client.(
        Httpkit.Client.Request.create(
          ~headers=[("User-Agent", "tldr-cli")],
          ~body,
          `POST,
          Uri.add_query_param'(url |> Uri.of_string, queryparams),
        )
        |> Https.send
        >>= Response.body
        >>= (_ => Lwt_result.return())
      );
    };
};
