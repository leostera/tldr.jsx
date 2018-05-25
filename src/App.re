type effect('a, 'b) = 'a => Js.Promise.t('b);

type reducer('state, 'action) = (~state: 'state, ~action: 'action) => 'state;

type t('state, 'action) = {
  effects: list(effect('state, 'action)),
  initialState: 'state,
  initialAction: 'action,
  reducer: reducer('state, 'action),
};

let run = (app: t('state, 'action)) => {
  let state = ref(app.initialState);
  let rec step = action => {
    /* compute new state, save it in the reference */
    state := app.reducer(~state=state^, ~action);
    /* iterate and execute side-effects */
    let runEffect = e =>
      Js.Promise.(
        e(state^),
        value => {
          step(value);
          ();
        },
      );
    /* app.effects |> List.iter(runEffect); */
    /* return this step's end state */
    state^;
  };
  step(app.initialAction);
};
