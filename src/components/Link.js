//@flow

import React from 'React'

type LinkProps = {
  href: String,
  text: String
}

export default ({href, text}: LinkProps) =>
  <a href={href}>{text.toLowerCase()}</a>
