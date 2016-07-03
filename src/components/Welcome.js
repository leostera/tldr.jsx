import React from 'react'

import Tldr from './Tldr'
import Link from './Link'
import { Markdown, Cr } from './Markdown'

import hello from '../lib/hello'

let random = (list) => list[Math.floor(Math.random()*list.length)]

const Welcome = () => (
  <Markdown className="content">
    # {random(hello)}!
{Cr}
    We tried to learn other languages, but since we didn't find a <Tldr size="small" /> for them it might not say "Welcome". We extend our deepest apologies.
{Cr}
    ### How do I use this thing?
{Cr}
    See the input box by the logo? Just type in a command and see the magic happen!
{Cr}
    Try <code>osx/say</code>, <code>linux/du</code>, or simply <code>man</code>.
{Cr}
    Some commands are widely available with the same interface, some other have variants per operating system. Currently the <code>tldr-pages</code> project splits comman into 4 categories: common, linux, osx, and sunos.
{Cr}
    <code>du</code>, for example, is available under both <code>linux</code> and <code>osx</code>.
{Cr}
    ### What is <Tldr size="small" />?
{Cr}
    This is a web client for a project called <code>tldr-pages</code>; they are a community effort to simplify the beloved man pages with practical examples.
{Cr}
    Nifty indeed.
{Cr}
    Read more and join the tldr wagon at <Link href="https://tldr-pages.github.io/" text="tldr-pages.github.io" />
{Cr}
    ### Do you have any unwanted pieces of trivia for me?
{Cr}
Well, this small app was built with ES6, type-checked using FlowType, the amazing reactivity is provided by RxJS, and all the rendering is done with React. It's got a nice 12-LOC long Markdown component that works _great_ with nested React components. See these links? <Link href="https://github.com/ostera/tldr.jsx/blob/master/src/components/Welcome.js" text="Check the source" />
{Cr}
    Have a <Link href="https://github.com/ostera/tldr.jsx" text="look inside" /> and feel free to <Link href="https://github.com/ostera/tldr.jsx/fork" text="fork" />
  </Markdown>
)
export default Welcome
