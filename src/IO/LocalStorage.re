[@bs.val]
external ext__setItem : (string, string) => unit =
  "window.localStorage.setItem";

[@bs.val]
external ext__getItem : string => Js.nullable(string) =
  "window.localStorage.getItem";

[@bs.val]
external ext__removeItem : string => unit = "window.localStorage.removeItem";

type k = string;

type v = string;

let set = ext__setItem;

let get = key => Js.toOption(ext__getItem(key));

/* Lord knows why |> and |. did not work with Belt.Result.Ok */
let remove = key => Belt.Result.Ok(ext__removeItem(key));
