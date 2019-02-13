open Revery;
open Revery.Core;
open Revery.UI;

Fmt_tty.setup_std_outputs();
Logs.set_level(Some(Logs.Debug));
Logs.set_reporter(Logs_fmt.reporter());

type state =
  | Bootstrap
  | Ready(Native.Index.t)
  | Error
  | Searching(Native.Index.t, Model.Command.t)
  | Display(Native.Index.t, Model.Command.t, Model.Page.t);

type action =
  | Index_loaded(Native.Index.t)
  | Something_went_wrong
  | Search(string);

let reducer = (state, action) =>
  switch (action) {
  | Search(_) => state
  | Index_loaded(index) => Ready(index)
  | Something_went_wrong => Error
  };

let run_effects = (state, dispatch, (), ()) => {
  switch (state) {
  | Bootstrap =>
    Logs.app(m => m("Bootstrapping..."));
    let index = Native.Index.create() |> Lwt_main.run;
    Logs.app(m => m("Got index..."));
    switch (index) {
    | Ok(index) => dispatch(Index_loaded(index))
    | Error(_) => dispatch(Something_went_wrong)
    };
  | _ => ()
  };
};

module Loading = {
  let component = React.component("Loading");

  let make = () =>
    component((_slots: React.Hooks.empty) => {
      let style =
        Style.make(~color=Colors.grey, ~fontSize=14, ~margin=16, ());

      <View> <Text style text="Loading..." /> </View>;
    });

  let createElement = (~children as _, ()) => make() |> React.element;
};

let init = app => {
  let win = App.createWindow(app, "TLDR Pages");

  let render = () => {
    let s = App.getState(app);

    run_effects(state, 

    <View
      style={Style.make(
        ~position=LayoutTypes.Absolute,
        ~justifyContent=LayoutTypes.JustifyCenter,
        ~alignItems=LayoutTypes.AlignCenter,
        ~bottom=0,
        ~top=0,
        ~left=0,
        ~right=0,
        ~flexDirection=LayoutTypes.Row,
        (),
      )}>
      {switch (s) {
       | Bootstrap => <Loading />
       | _ => <View />
       }}
    </View>;
  };

  UI.start(win, render);
};

App.startWithState(Bootstrap, reducer, init);
