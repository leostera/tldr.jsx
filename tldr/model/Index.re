module type Base = {
  type t;

  type io('a);

  let create: unit => io(t);

  let lookup_by_name: (t, string) => io(option(Command.t));

  let page_for_command: Command.t => io(result(Page.t, [> | `Not_found]));
};

module Make = (M: Base) : (Base with type io('a) = M.io('a)) => {
  type t = M.t;

  type io('a) = M.io('a);

  let create = M.create;

  let lookup_by_name = M.lookup_by_name;

  let page_for_command = M.page_for_command;
};
