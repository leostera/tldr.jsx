import React from 'react'

import Tldr from './Tldr'

import hello from '../lib/hello'

let random = (list) => list[Math.floor(Math.random()*list.length)]

const Welcome = () => (
  <section className="content">
      <h1>{random(hello)}!</h1>
      <p> We tried to learn other languages, but since we didn't find a <Tldr size="small" /> for them it might not look good. We extend our deepest apologies. </p>
      <p> By the way, just type in a command and see the magic happen! </p>
  </section>
)

export default Welcome
