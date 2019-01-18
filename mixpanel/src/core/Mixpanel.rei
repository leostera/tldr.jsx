module API: {
  type t = {base_url: string};

  let v1: t;
};

module Token: {
  type t;

  let of_string: string => t;
};

module Tracker: {
  type t;

  let make: (~api: API.t, ~token: string) => t;
};

module Event: {
  type t;

  let name: t => string;
  let properties: t => list((string, string));

  let event:
    (
      ~id: string,
      ~name: string,
      ~properties: list((string, string))=?,
      ~ip: string,
      unit
    ) =>
    t;
};
