let component = ReasonReact.statelessComponent("Spacer");

let make = (~direction, ~alignment=?, children) => {
  {
    ...component,
    render: self =>
      <div
        style=ReactDOMRe.Style.(
          combine(
            combine(
              make(~display="flex", ()),
              switch (direction) {
              | `Left_to_right => make(~flexDirection="row", ())
              | `Right_to_left => make(~flexDirection="row-reverse", ())
              },
            ),
            switch (alignment) {
            | None => make()
            | Some(`Center) => make(~justifyContent="center", ())
            },
          )
        )>
        {ReasonReact.array(children)}
      </div>,
  };
};
