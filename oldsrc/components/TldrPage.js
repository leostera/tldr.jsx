//@flow

/*******************************************************************************
 * Imports
 *******************************************************************************/

import React from 'react'
import marked from 'marked'

import type { Page } from 'tldr/Page'

import { Markdown } from 'tldr/components/Markdown'
import Link from 'tldr/components/Link'

/*******************************************************************************
 * Public API
 *******************************************************************************/

export default ({body, path}: Page) => (
  <section className="content" >
    <Markdown className="page" body={body} />
    <Link href={path} text="Edit this page on Github" />
  </section>
)
