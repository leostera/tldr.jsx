open Model;

let initialState: state = {
  index: None,
  page: None,
  meta: {
    revision: "asd123c",
    version: "1",
  },
  params: {
    debug: true,
  },
};

let reducer = (state, action) =>
  switch (action) {
  | Unchanged => state
  | Bootstrap(initialState) => initialState
  };

let effects = [Log.make()];

let app: App.t(state, action) = {
  initialAction: Bootstrap(initialState),
  effects,
  reducer,
  initialState,
};

App.run(app);
