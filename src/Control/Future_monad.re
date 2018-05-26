include (
  Monad.Make(
    {
      type t('a) = Future.t('a);
      let return = Future.value;
      let bind = Future.flatMap;
    },
  ):
    Monad.S with type t('a) := Future.t('a)
);
