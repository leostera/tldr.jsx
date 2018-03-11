type command = {
  name: string;
  platform: Agent.os;
}

type command_match =
  | Exact of command
  | Similar of command * int
  | NoMatch

let compare_command a b =
  Levenshtein.distance a.name b.name

let find_in_index (index : command list) (c : command) =
  List.find ~f:()
