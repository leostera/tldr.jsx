module Style = ReactDOMRe.Style;

let component = ReasonReact.statelessComponent("Border");

let make = (~state, _children) => {
  ...component,
  render: self =>
    <div
      style={Style.combine(
        state |> Design_system.Atom.Border.make |> CSS.Atom.Border.to_css,
        Style.make(
          ~borderStyle="solid",
          ~borderWidth="1px",
          ~bottom="0",
          ~left="0",
          ~position="absolute",
          ~right="0",
          ~top="0",
          ~zIndex="-1",
          (),
        ),
      )}
    />,
};
