let component = ReasonReact.statelessComponent("Spacer");

let make = (~size, _children) => {
  {
    ...component,
    render: self =>
      <div
        style={
          size |> Design_system.Atom.Spacer.make |> CSS.Atom.Spacer.to_css
        }
      />,
  };
};
