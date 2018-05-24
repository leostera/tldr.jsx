module type Key_value = {
  type t;
  let set: (string, t) => unit;
  let get: string => option(t);
  let remove:
    string => Belt.Result.t(unit, [< | `Could_not_remove]);
};
