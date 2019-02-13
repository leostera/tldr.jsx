let component = ReasonReact.statelessComponent("SearchInput");

let make = (~feedbackState, ~placeholder, ~value, children) => {
  {
    ...component,
    render: self =>
      /* TODO(@ostera): Please refactor this into something else :) */
      <Block height="70px" width="100%">
        <Border state=feedbackState />
        {switch (value) {
         | None =>
           <Fixed>
             <Column direction=`Top_down>
               <Spacer size=`S />
               <Row direction=`Left_to_right>
                 <Spacer size=`S />
                 <Text style={Design_system.Atom.Text.Main(`Gray)}>
                   {ReasonReact.string(placeholder)}
                 </Text>
               </Row>
             </Column>
           </Fixed>
         | Some(_) => <div />
         }}
        <Fixed>
          <Column direction=`Top_down>
            <Spacer size=`S />
            <Row direction=`Left_to_right>
              <Spacer size=`S />
              <Input
                textStyle={
                  switch (feedbackState) {
                  | `Default => Design_system.Atom.Text.Main(`Black)
                  | `Error => Design_system.Atom.Text.Main(`Error)
                  }
                }
                value={
                  switch (value) {
                  | None => ""
                  | Some(s) => s
                  }
                }
                onChange={_ => ()}
              />
            </Row>
          </Column>
        </Fixed>
      </Block>,
  };
};
