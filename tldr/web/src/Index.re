ReactDOMRe.renderToElementWithId(
  <Row direction=`Left_to_right alignment=`Center>
    <Block width="700px">
      <Column direction=`Top_down>
        <NavBar feedbackState=`Default />
        <Spacer size=`XL />
        <Spacer size=`XL />
        <Content
          text=[
            "How do I use this thing?",
            "See the input box by the logo? Just type in a command and see the magic happen!",
            "Try osx/say, linux/du, or simply man.",
            "Some commands are widely available with the same interface, some other have variants per operating system. Currently the tldr-pages project splits commands into 4 categories: common, linux, osx, and sunos.",
            "du, for example, is available under both linux and osx.",
          ]
        />
      </Column>
    </Block>
  </Row>,
  "text",
);
