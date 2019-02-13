let component = ReasonReact.statelessComponent("Fixed");

let make = children => {
  {
    ...component,
    render: self =>
      <div style={ReactDOMRe.Style.make(~position="absolute", ())}>
        {ReasonReact.array(children)}
      </div>,
  };
};
