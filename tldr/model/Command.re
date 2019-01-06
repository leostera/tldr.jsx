type name = string;
type platform = string;

type t = {
  name,
  platforms: list(platform),
};
