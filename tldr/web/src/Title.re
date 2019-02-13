module Style = ReactDOMRe.Style;

let component = ReasonReact.statelessComponent("Title");

let make = _children => {
  ...component,
  render: self =>
    /* TODO(@ostera): map 70px to the SearchInput */
    <Block height="70px" width="120px">
      <Column direction=`Top_down>
        <Spacer size=`S />
        <Text style={Design_system.Atom.Text.Main(`Black)}>
          {ReasonReact.string("tldr")}
        </Text>
      </Column>
    </Block>,
};
