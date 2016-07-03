import React from 'react'

import { Markdown, Cr } from './Markdown'
import Link from './Link'
import Tldr from './Tldr'

export default props => (
  <Markdown className="content">
    # Oops! Command not found!
{Cr}
    We looked and looked for it, but it's nowhere. Maybe you can help us find it?
{Cr}
    <Tldr size="small"/> is a community effort, we need people like you to raise the bar and
      find missing commands, suggest editions, and propose new pages.
{Cr}
    ### How can I help?
{Cr}
    Take a look at the open <Link href="https://github.com/tldr-pages/tldr/issues?q=is%3Aopen+is%3Aissue+label%3Acommand" text="Command Requests" /> to throw a jab at things people need, or maybe join in on any of the open <Link href="https://github.com/tldr-pages/tldr/pulls" text="command proposals" />.
{Cr}
    If the command you want hasn't been proposed yet, feel encouraged to submit a proposal yourself! 😉 &mdash; <Link href="https://github.com/tldr-pages/tldr/blob/master/CONTRIBUTING.md" text="Start here" />
{Cr}
  </Markdown>
)

