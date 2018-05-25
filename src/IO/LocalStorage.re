module FFI = {
  [@bs.val]
  external ext__setItem : (string, string) => unit =
    "window.localStorage.setItem";
  [@bs.val]
  external ext__getItem : string => Js.nullable(string) =
    "window.localStorage.getItem";
  [@bs.val]
  external ext__removeItem : string => unit = "window.localStorage.removeItem";
};

module LocalStorage: Storage.Key_value = {
  type k = string;
  type v = string;
  let set = FFI.ext__setItem;
  let get = key => Js.toOption(FFI.ext__getItem(key));
  let remove = key => Belt.Result.Ok(FFI.ext__removeItem(key));
};

include LocalStorage;
