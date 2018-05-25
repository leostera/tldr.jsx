module type Key_value = {
  type k;
  type v;
  let set: (k, v) => unit;
  let get: k => option(v);
  let remove: k => Belt.Result.t(unit, [< | `Could_not_remove]);
};
