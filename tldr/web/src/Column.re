let component = ReasonReact.statelessComponent("Spacer");

let make = (~direction, children) => {
  {
    ...component,
    render: self =>
      <div
        style=ReactDOMRe.Style.(
          combine(
            make(~display="flex", ()),
            switch (direction) {
            | `Top_down => make(~flexDirection="column", ())
            },
          )
        )>
        {ReasonReact.array(children)}
      </div>,
  };
};
