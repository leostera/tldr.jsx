//@flow

/*******************************************************************************
 * Imports
 *******************************************************************************/

import React from 'react'

/*******************************************************************************
 * Type Definitions
 *******************************************************************************/

type LinkProps = {
  href: String,
  text: String
}

/*******************************************************************************
 * Public API
 *******************************************************************************/

export default ({href, text}: LinkProps) =>
  <a href={href}>{text.toLowerCase()}</a>
