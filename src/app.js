//@flow

/*
 * Things to strive for as a programmer:
 * 1. Unreadability -> Readability
 * 2. Statefulness -> Referential Transparecy
 * 3. Baroqueness -> Simplicity
 */

/*******************************************************************************
 * Utils!
 *******************************************************************************/

const log = console.log.bind(console)

/*******************************************************************************
 * Presentation!
 *******************************************************************************/

import React from 'react'
import ReactDOM from 'react-dom'

import Octocat from './Octocat'

const NavBar = React.createClass({
  render() {
    return (
      <nav>
        <a class="brand" />
        <Octocat path="ostera/tldr.jsx" />
      </nav>
    )
  }
})

const Spinner = React.createClass({
  render() {
    return ( <span> {this.props.text}... </span> )
  }
})

const TldrApp = React.createClass({
  render() {
    return (
      <section>
        <NavBar />
      </section>
    )
  }
})

/*******************************************************************************
 * Data!
 *******************************************************************************/

import { Observable } from 'rxjs/Observable'
import 'rxjs/add/observable/dom/webSocket'
import 'rxjs/add/observable/from'
import 'rxjs/add/operator/debounce'
import 'rxjs/add/operator/filter'
import 'rxjs/add/operator/map'


import { createHistory } from 'history'
import './observable.history'

export type Platform = 'common' | 'linux' | 'osx' | 'sunos'

export class Command {
  name:     string;
  platform: Platform;
}

export type Path = string

export class Page {
  cmd:  Command;
  path: Path;
  body: string;
}

let render = (page: Page): any => {
  ReactDOM.render( (
    <TldrApp page={page} />
  ), document.getElementById("tldr"))
}

Observable
  .history(createHistory())
  .debounce(500)
  //  .filter(exists)
  //  .map(fetch)
  .subscribe(render)
