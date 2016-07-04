//@flow

/*******************************************************************************
 * Imports
 *******************************************************************************/

import React from 'react'

import Tldr from './Tldr'

/*******************************************************************************
 * Type Definitions
 *******************************************************************************/

type NavigateProps = {
  navigate(to: string): any;
}

/*******************************************************************************
 * Public API
 *******************************************************************************/

export default ({navigate}: NavigateProps) => (
  <nav>
    <section className="content">
      <Tldr />
      <input
        type="text"
        onChange={ ({target: {value}}) => navigate(value) }
        placeholder="Command name"
      />
    </section>
  </nav>
)

