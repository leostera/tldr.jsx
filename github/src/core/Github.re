module API = {
  type t = {base_url: string};

  let v3 = {base_url: "https://api.github.com/"};
};

module Repo = {
  type t = {
    owner: string,
    name: string,
  };

  let make = (~owner, ~name) => {owner, name};
};

module File = {
  type t = {content: string};

  let make = (~content) => {content: content};
};
