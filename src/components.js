import type { Page } from './Page'
import type { Command } from './Command'

import React from 'react'
import ReactDOM from 'react-dom'

import marked from 'marked'

const Debug = (props) =>
  <pre className="debug">
    <h2>Debug:</h2>
    {JSON.stringify(props, null, "  ")}
  </pre>


let navigate = (history: History) => (path: string) =>
  history.push({...history.getCurrentLocation(), pathname: `/${path}`})

const Nav = ({navigate}) => (
  <nav>
    <a className="brand" href="/" />
    <input
      type="text"
      onChange={ ({target: {value}}) => navigate(value) }
      placeholder="Command name"
    />
  </nav>
)

const TldrPage = ({body, path}: Page) => (
  <section className="content" dangerouslySetInnerHTML={{__html: marked(body)}}>
  </section>
)

const NotFound = which => props => (
  <section className="content">
    <h1> Oops! {which} not found! </h1>
    <p> We looked and looked for it, but it's nowhere. Maybe you can help us find it? </p>
  </section>
)

const CommandNotFound = NotFound("Command")
const PageNotFound = NotFound("Page")

const Welcome = () => (
  <section className="content">
      <h1>Welcome!</h1>
  </section>
)

export default (props) => {
  let {found, page, state: {debug, command, history}} = props
  ReactDOM.render((
    <section>
      <Nav navigate={navigate(history)} />
      { !command.name && <Welcome /> }
      { command.name && !found && <CommandNotFound /> }
      { found && page && !page.error && <TldrPage {...page} /> }
      { found && page &&  page.error && <PageNotFound /> }
      { debug && <Debug {...props} /> }
    </section>
  ), document.getElementById('tldr'))
}
