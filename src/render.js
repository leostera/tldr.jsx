//@flow

import React from 'react'
import ReactDOM from 'react-dom'

import Debug from './components/Debug'
import Nav from './components/Nav'
import Footer from './components/Footer'
import NotFound from './components/NotFound'
import TldrPage from './components/TldrPage'
import Welcome from './components/Welcome'

import type { History } from 'history'
import type { State } from './Tldr'

let navigate = (history: History) => (path: string) =>
  history.push({...history.getCurrentLocation(),
               pathname: `/${path.toLowerCase().trim().replace(' ','-')}`})

const Oops = () => (
  <section className="content">
    <h1> Holy! Page not found! </h1>
    <p> Something has gone terribly wrong. </p>
  </section>
)

const Loading = () => (
  <section className="content loading"> Loading... </section>
)

export default (props: State) => {
  let {found, page, params: {_, debug, command, history}} = props
  try {
    ReactDOM.render((
      <section>
        <Nav navigate={navigate(history)} version={_}/>
        { !command.name && <Welcome /> }
        { command.name && found === undefined && <Loading /> }
        { command.name && found === false     && <NotFound /> }
        { found && page && !page.error && <TldrPage {...page} /> }
        { found && page &&  page.error && <Oops /> }
        { debug && <Debug {...props} /> }
        <Footer />
      </section>
    ), document.getElementById('tldr'))
  } catch (e) {
    console.log(e)
  }
}
