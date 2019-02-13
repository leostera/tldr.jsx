module Style = ReactDOMRe.Style;

let component = ReasonReact.statelessComponent("Input");

let make = (~textStyle, ~value, ~onChange, _children) => {
  ...component,
  render: self =>
    <input
      style={Style.combine(
        textStyle |> Design_system.Atom.Text.make |> CSS.Atom.Text.to_css,
        Style.make(
          ~outline="none",
          ~backgroundColor="transparent",
          ~borderWidth="0",
          ~padding="0",
          (),
        ),
      )}
      onChange
      defaultValue=value
    />,
};
