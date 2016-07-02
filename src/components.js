import type { Page } from './Page'
import type { Command } from './Command'

import React from 'react'
import ReactDOM from 'react-dom'

import marked from 'marked'

const Debug = (props) =>
  <pre> {JSON.stringify(props, null, "  ")} </pre>

const Nav = ({history, command: {name}}) => (
  <nav>
    <input
      type="text"
      onChange={ ({target: {value}}) => { history.push({pathname: `/${value}`}) } }
      defaultValue={name}
    />
  </nav>
)

const TldrPage = ({body, path}: Page) => (
  <pre dangerouslySetInnerHTML={{__html: marked(body)}}></pre>
)

const NotFound = (props) => (
  <h1> Oops! Page not found! </h1>
)

const TldrApp = (props) => (
  <section>
    <Nav {...props.state} />
    { !props.found && <NotFound {...props} /> }
    { props.found && !props.page.error && <TldrPage {...props.page} /> }
    { props.found && props.page.error && <NotFound {...props} /> }
    <Debug {...props} />
  </section>
)

export default (opts) => {
  ReactDOM.render((
    <TldrApp {...opts} />
  ), document.getElementById('tldr'))
}

