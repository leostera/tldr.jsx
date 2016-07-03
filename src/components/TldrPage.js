import React from 'react'
import marked from 'marked'

import type { Page } from '../Page'

import Link from './Link'

export default ({body, path}: Page) => (
  <section className="content" >
    <section className="page" dangerouslySetInnerHTML={{__html: marked(body)}}></section>
    <Link href={path} text="Edit this page on Github" />
  </section>
)
