include (
  Monad.Make(
    {
      type t('a) = option('a);
      let return = x => Some(x);
      let bind = (o, f) =>
        switch (o) {
        | None => None
        | Some(x) => f(x)
        };
    },
  ):
    Monad.S with type t('a) := option('a)
);
