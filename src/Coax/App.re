open Option_monad;

type effect('a, 'b) = 'a => option(Js.Promise.t('b));

type reducer('state, 'action) = ('state, 'action) => 'state;

type t('state, 'action) = {
  effects: list(effect('state, 'action)),
  initialState: 'state,
  initialAction: 'action,
  reducer: reducer('state, 'action),
};

let run = app => {
  let state = ref(app.initialState);
  let rec step = action => {
    /* compute new state, save it in the reference */
    state := app.reducer(state^, action);
    /* auxiliary function to run an effect with the current state and step */
    let runEffect = e =>
      e(state^)
      >>| Js.Promise.then_(action' => {
            step(action');
            Js.Promise.resolve();
          })
      >>| Js.Promise.catch(err => {
            Js.log2("Error: ", err);
            Js.Promise.resolve();
          });
    /* iterate and execute side-effects */
    app.effects |> List.map(runEffect);
  };
  step(app.initialAction);
};
