import React from 'react'

import Link from './Link'
import Tldr from './Tldr'

export default props => (
  <section className="content">
    <h1> Oops! Command not found! </h1>
    <p> We looked and looked for it, but it's nowhere. Maybe you can help us find it? </p>
    <p>
      <Tldr size="small"/> is a community effort, we need people like you to raise the bar and
      find missing commands, suggest editions, and propose new pages.
    </p>
    <p>
      Take a look at the open <Link href="https://github.com/tldr-pages/tldr/issues?q=is%3Aopen+is%3Aissue+label%3Acommand" text="Command Requests" /> or join in on any of the open <Link href="https://github.com/tldr-pages/tldr/pulls" text="command proposals" />.
    </p>
  </section>
)

