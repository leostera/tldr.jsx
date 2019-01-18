open Revery;
open Revery.Core;
open Revery.Core.Events;
open Revery.Core.Window;
open Revery.UI;
open Revery.UI.Components;

module Loading = (
  val component((render, ~children, ()) =>
        render(
          () => {
            let style =
              Style.make(
                ~flexDirection=LayoutTypes.Row,
                ~alignItems=LayoutTypes.AlignStretch,
                ~justifyContent=LayoutTypes.JustifyCenter,
                ~flexGrow=1,
                (),
              );
            <view style> <text> "Loading..." </text> </view>;
          },
          ~children,
        )
      )
);

module Button = (
  val component(
        (
          render,
          ~fontFamily="Helvetica",
          ~contents: string,
          ~onClick,
          ~children,
          (),
        ) =>
        render(
          () => {
            let clickableStyle =
              Style.make(
                ~position=LayoutTypes.Relative,
                ~backgroundColor=Colors.lightGrey,
                ~justifyContent=LayoutTypes.JustifyCenter,
                ~alignItems=LayoutTypes.AlignCenter,
                ~flexGrow=1,
                /* Min width */
                ~width=150,
                ~margin=10,
                (),
              );
            let viewStyle =
              Style.make(
                ~position=LayoutTypes.Relative,
                ~justifyContent=LayoutTypes.JustifyCenter,
                ~alignItems=LayoutTypes.AlignCenter,
                (),
              );
            let textStyle =
              Style.make(~color=Colors.black, ~fontFamily, ~fontSize=32, ());

            <Clickable style=clickableStyle onClick>
              <view style=viewStyle>
                <text style=textStyle> contents </text>
              </view>
            </Clickable>;
          },
          ~children,
        )
      )
);

type state =
  | Loading
  | Ready(Native.Index.t)
  | Searching(Native.Index.t, Model.Command.t)
  | Display(Native.Index.t, Model.Command.t, Model.Page.t);

type action =
  | Search(string);

let reducer = (state, action) =>
  switch (action) {
  | Search(string) => state
  };

module Tldr = (
  val component((render, ~window, ~children, ()) =>
        render(
          () => {
            let (state, _dispatch) = useReducer(reducer, Loading);

            switch (state) {
            | Loading => <Loading />
            | _ => <Loading />
            };
          },
          ~children,
        )
      )
);

let init = app => {
  let window = App.createWindow(app, "TLDR Pages");
  UI.start(window, () => <Tldr window />);
};

App.start(init);
