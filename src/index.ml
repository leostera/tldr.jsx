type command = {
  name: string;
  platform: Agent.os;
}

type index =
  | Index of command list
  | EmptyIndex
