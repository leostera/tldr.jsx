//@flow

/*******************************************************************************
 * Imports
 *******************************************************************************/

import React from 'react'
import marked from 'marked'

import type { Page } from '../Page'

import { Markdown } from './Markdown'
import Link from './Link'

/*******************************************************************************
 * Public API
 *******************************************************************************/

export default ({body, path}: Page) => (
  <section className="content" >
    <Markdown className="page" body={body} />
    <Link href={path} text="Edit this page on Github" />
  </section>
)
