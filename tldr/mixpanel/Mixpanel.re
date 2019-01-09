module API = {
  type t = {base_url: string};

  let v1 = {base_url: "https://api.mixpanel.com"};
};

module Token = {
  type t = string;

  let of_string = x => x;
};

module Tracker = {
  type t = {
    api: API.t,
    token: string,
  };

  let make = (~api, ~token) => {api, token};
};

module Event = {
  type t = {
    id: string,
    name: string,
    properties: list((string, string)),
    ip: string,
  };

  let name = t => t.name;
  let properties = t => t.properties;

  let event = (~id, ~name, ~properties=?, ~ip, ()) => {
    {
      id,
      name,
      properties:
        switch (properties) {
        | Some(pps) => pps
        | None => []
        },
      ip,
    };
  };
};
