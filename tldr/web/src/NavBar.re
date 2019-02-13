module Style = ReactDOMRe.Style;

let component = ReasonReact.statelessComponent("Title");

let make = (~feedbackState, ~commandName=?, _children) => {
  ...component,
  render: self => {
    <Row direction=`Left_to_right>
      <Title />
      <Spacer size=`XL />
      <SearchInput
        placeholder="command name"
        feedbackState
        value=commandName
      />
    </Row>;
  },
};
