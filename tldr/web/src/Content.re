module Style = ReactDOMRe.Style;

let component = ReasonReact.statelessComponent("Content");

let make = (~text, _children) => {
  ...component,
  render: self =>
    <Row direction=`Left_to_right>
      <Spacer size=`XL />
      <Spacer size=`XL />
      <Spacer size=`XL />
      <Spacer size=`XL />
      <Spacer size=`XL />
      <Spacer size=`XL />
      <Spacer size=`XL />
      <Spacer size=`XL />
      <Detail pars=text />
    </Row>,
};
