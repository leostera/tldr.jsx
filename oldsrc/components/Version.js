//@flow

/*******************************************************************************
 * Imports
 *******************************************************************************/

import React from 'react'

import type { Package } from 'tldr/Tldr'

/*******************************************************************************
 * Type Definitions
 *******************************************************************************/

type VersionProps = Package;
/*******************************************************************************
 * Public API
 *******************************************************************************/

export default ({Version, Revision}: VersionProps) => {
  const Origin = `https://github.com/ostera/tldr.jsx/tree/${Revision}`
  return (<a className="version" href={Origin}>v{Version}</a>)
}
