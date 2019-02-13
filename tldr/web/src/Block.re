let component = ReasonReact.statelessComponent("SearchInput");

let make = (~height=?, ~width=?, children) => {
  {
    ...component,
    render: self =>
      <div
        style=ReactDOMRe.Style.(
          combine(
            combine(
              switch (height) {
              | None => make()
              | Some(x) => make(~height=x, ())
              },
              switch (width) {
              | None => make()
              | Some(x) => make(~width=x, ())
              },
            ),
            make(~position="relative", ()),
          )
        )>
        {ReasonReact.array(children)}
      </div>,
  };
};
