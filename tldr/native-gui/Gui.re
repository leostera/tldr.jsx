open Revery;
open Revery.Core;
open Revery.Core.Events;
open Revery.Core.Window;
open Revery.UI;
open Revery.UI.Components;

module Row = (
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
            <view style> ...children </view>;
          },
          ~children,
        )
      )
);

module Column = (
  val component((render, ~children, ()) =>
        render(
          () => {
            let style =
              Style.make(
                ~flexDirection=LayoutTypes.Column,
                ~alignItems=LayoutTypes.AlignStretch,
                ~justifyContent=LayoutTypes.JustifyCenter,
                ~backgroundColor=Colors.darkGrey,
                ~flexGrow=1,
                (),
              );
            <view style> ...children </view>;
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

module Display = (
  val component((render, ~display: string, ~curNum: string, ~children, ()) =>
        render(
          () => {
            let viewStyle =
              Style.make(
                ~backgroundColor=Colors.white,
                ~height=120,
                ~flexDirection=LayoutTypes.Column,
                ~alignItems=LayoutTypes.AlignStretch,
                ~justifyContent=LayoutTypes.JustifyFlexStart,
                ~flexGrow=2,
                (),
              );
            let displayStyle =
              Style.make(
                ~color=Colors.black,
                ~fontFamily="Roboto-Regular.ttf",
                ~fontSize=20,
                ~margin=15,
                (),
              );
            let numStyle =
              Style.make(
                ~color=Colors.black,
                ~fontFamily="Roboto-Regular.ttf",
                ~fontSize=32,
                ~margin=15,
                (),
              );

            <view style=viewStyle>
              <text style=displayStyle> display </text>
              <text style=numStyle> curNum </text>
            </view>;
          },
          ~children,
        )
      )
);

type state =
  | Loading
  | Ready(Model.Index.t)
  | Searching(Model.Index.t, Model.Command.t)
  | Display(Model.Index.t, Model.Command.t, Model.Page.t);

type eff('i, 'o, 'e) =
  | Request('i)
  | Respnose(result('o, 'e));

type err = [ | `Error];

type action =
  | Bootstrap(eff(Model.Index.t, unit, err))
  | Search(eff(Model.Command.t, string, err));

let reducer = (state, action) =>
  switch (action) {
  | Bootstrap(Request ()) => Loading
  };

module Tldr = (
  val component((render, ~window, ~children, ()) =>
        render(
          () => {
            let (state, dispatch) = useReducer(reducer, Loading);

            <Container />;
          },
          ~children,
        )
      )
);

(
  app => {
    let window = App.createWindow(app, "TLDR Pages");
    UI.start(window, () => <Tldr window />);
  }
)
|> App.start
|> Lwt_main.run;
