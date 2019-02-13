module Style = ReactDOMRe.Style;

let component = ReasonReact.statelessComponent("Title");

let make = (~pars, _children) => {
  ...component,
  render: self =>
    <Column direction=`Top_down>
      {pars
       |> List.map(p =>
            <Text style=Design_system.Atom.Text.Detail>
              {ReasonReact.string(p)}
            </Text>
          )
       |> List.fold_left((acc, e) => [<Spacer size=`M />, e, ...acc], [])
       |> List.tl
       |> List.rev
       |> Array.of_list
       |> ReasonReact.array}
    </Column>,
};
