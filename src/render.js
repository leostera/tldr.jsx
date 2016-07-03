import React from 'react'
import ReactDOM from 'react-dom'

import Debug from './components/Debug'
import Nav from './components/Nav'
import NotFound from './components/NotFound'
import TldrPage from './components/TldrPage'
import Welcome from './components/Welcome'

let navigate = (history: History) => (path: string) =>
  history.push({...history.getCurrentLocation(),
               pathname: `/${path.toLowerCase().trim().replace(' ','-')}`})

const Oops = (error) => (
  <section className="content">
    <h1> Holy! Page not found! </h1>
    <p> Something has gone terribly wrong. </p>
  </section>
)

const Loading = () => (
  <section className="content loading"> Loading... </section>
)

export default (props) => {
  let {found, page, state: {debug, command, history}} = props
  try {
    ReactDOM.render((
      <section>
        <Nav navigate={navigate(history)} />
        { !command.name && <Welcome /> }
        { command.name && found === undefined && <Loading /> }
        { command.name && found === false     && <NotFound /> }
        { found && page && !page.error && <TldrPage {...page} /> }
        { found && page &&  page.error && <Oops /> }
        { debug && <Debug {...props} /> }
      </section>
    ), document.getElementById('tldr'))
  } catch (e) {
    console.log(e)
  }
}
