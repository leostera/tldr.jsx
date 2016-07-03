import React from 'react'

import Tldr from './Tldr'
import Link from './Link'

import hello from '../lib/hello'

let random = (list) => list[Math.floor(Math.random()*list.length)]

const Welcome = () => (
  <section className="content">
      <h1>{random(hello)}!</h1>
      <p> We tried to learn other languages, but since we didn't find a <Tldr size="small" /> for them it might not say "Welcome". We extend our deepest apologies. </p>
      <h3> How do I use this thing? </h3>
      <p> See the input box by the logo? Just type in a command and see the magic happen! </p>
      <p> Try <code>osx/say</code>, <code>linux/du</code>, or simply <code>man</code>. </p>
      <p> Some commands are widely available with the same interface, some other have variants per operating system. Currently the <code>tldr-pages</code> project splits comman into 4 categories: common, linux, osx, and sunos.</p>
      <p> <code>du</code>, for example, is available under both <code>linux</code> and <code>osx</code>. </p>
      <h3> What is <Tldr size="small" />? </h3>
      <p> This is a web client for a project called <code>tldr-pages</code>; they are a community effort to simplify the beloved man pages with practical examples. </p>
      <p> Nifty indeed. </p>
      <p> Read more and join the tldr wagon at <Link href="https://tldr-pages.github.io/" text="tldr-pages.github.io" /></p>
      <h3> Do you have any unwanted pieces of trivia for me? </h3>
      <p> Well, this small app was built with ES6, type-checked using FlowType, the amazing reactivity is provided by RxJS, and all the rendering is done with React.</p>
      <p>Have a <Link href="https://github.com/ostera/tldr.jsx" text="look inside" /> and feel free to <Link href="https://github.com/ostera/tldr.jsx/fork" text="fork" /> </p>
  </section>
)

export default Welcome
