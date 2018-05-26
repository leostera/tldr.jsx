open Model;

let make = () : App.effect(state, action) => {
  let last_state = ref(None);
  let log_and_update = state' => {
    Js.log(state');
    last_state := Some(state');
    ();
  };
  state => {
    switch (last_state^) {
    | None => log_and_update(state)
    | Some(last_state') =>
      switch (state == last_state') {
      | false => log_and_update(state)
      | _ => ()
      }
    };
    None;
  };
};
