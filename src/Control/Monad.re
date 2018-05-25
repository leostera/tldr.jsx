module type Base = {
  type t('a);
  let bind: (t('a), 'a => t('b)) => t('b);
  let return: 'a => t('a);
};

module type Infix = {
  type t('a);
  /*
      [t >>= f] returns a computation that sequences the computations
      represented by two monad elements.

      The resulting computation first does [t] to yield a value [v], and
      then runs the computation returned by [f v].
   */
  let (>>=): (t('a), 'a => t('b)) => t('b);
  /*
      [t >>= f] returns a computation that sequences the computations
      represented by two monad elements.

      The resulting computation first does [t] to yield a value [v], and
      then runs the computation returned by [f v].
   */
  let (>>|): (t('a), 'a => 'b) => t('b);
};

module type S = {
  include Infix;
  module Monad_infix: Infix with type t('a) := t('a);
  let bind: (t('a), 'a => t('b)) => t('b);
  let return: 'a => t('a);
  let join: t(t('a)) => t('a);
  /*
     User-friendly named operations
   */
  let map: (t('a), ~f: 'a => 'b) => t('b);
  let flatMap: (t('a), ~f: 'a => t('b)) => t('b);
  let ignore: t('a) => t(unit);
};

module Make = (Mod: Base) => {
  /*
     Base operations
   */
  type t('a) = Mod.t('a);
  let bind = Mod.bind;
  let return = Mod.return;
  /*
      Infix operations
   */
  module Monad_infix = {
    let (>>=) = bind;
    let (>>|) = (t, f) => t >>= (a => return(f(a)));
  };
  include Monad_infix;
  /*
      Derived operations
   */
  let map = (t, ~f) => t >>| f;
  let flatMap = (t, ~f) => t >>= f;
  let join = t => t >>= (t' => t');
  let ignore = map(~f=__ => ());
};

/*

 Monad modules defined for two types below!

 */
module type Base2 = {
  type t('a, 'd);
  let bind: (t('a, 'd), 'a => t('b, 'd)) => t('b, 'd);
  let return: 'a => t('a, _);
};

module type Infix2 = {
  type t('a, 'd);
  /*
     This operators are left biased, so the right value 'd is never modified
   */
  let (>>=): (t('a, 'd), 'a => t('b, 'd)) => t('b, 'd);
  let (>>|): (t('a, 'd), 'a => 'b) => t('b, 'd);
};

module type S2 = {
  include Infix2;
  module Monad_infix: Infix2 with type t('a, 'd) := t('a, 'd);
  let bind: (t('a, 'd), 'a => t('b, 'd)) => t('b, 'd);
  let return: 'a => t('a, _);
  let join: t(t('a, 'd), 'd) => t('a, 'd);
  /*
     User-friendly named operations
   */
  let map: (t('a, 'd), ~f: 'a => 'b) => t('b, 'd);
  let flatMap: (t('a, 'd), ~f: 'a => t('b, 'd)) => t('b, 'd);
  let ignore: t(_, 'd) => t(unit, 'd);
};

module Make2 = (Mod: Base2) => {
  /*
     Base operations
   */
  type t('a, 'd) = Mod.t('a, 'd);
  let bind = Mod.bind;
  let return = Mod.return;
  /*
      Infix operations
   */
  module Monad_infix = {
    let (>>=) = bind;
    let (>>|) = (t, f) => t >>= (a => return(f(a)));
  };
  include Monad_infix;
  /*
      Derived operations
   */
  let map = (t, ~f) => t >>| f;
  let flatMap = (t, ~f) => t >>= f;
  let join = t => t >>= (t' => t');
  let ignore = map(~f=__ => ());
};
