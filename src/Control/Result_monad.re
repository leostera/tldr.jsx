open Belt;

include (
  Monad.Make2(
    {
      type t('a, 'd) = Result.t('a, 'd);
      let return = x => Result.Ok(x);
      let bind = (r, f) =>
        switch (r) {
        | Result.Ok(x) => f(x)
        | Result.Error(err) => Result.Error(err)
        };
    },
  ):
    Monad.S2 with type t('a, 'd) := Result.t('a, 'd)
);
