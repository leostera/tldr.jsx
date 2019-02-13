let component = ReasonReact.statelessComponent("Component1");

let make = (~style, children) => {
  let css = style |> Design_system.Atom.Text.make |> CSS.Atom.Text.to_css;
  {
    ...component,
    render: self => <span style=css> {ReasonReact.array(children)} </span>,
  };
};
