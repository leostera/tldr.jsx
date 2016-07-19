//@flow

/*******************************************************************************
 * Imports
 *******************************************************************************/

import React from 'react'

import GithubButton from 'tldr/components/GithubButton'
import Tldr         from 'tldr/components/Tldr'
import Version      from 'tldr/components/Version'

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
      <section className="brand-and-version">
        <Tldr />
        <Version />
      </section>
      <section className="search">
        <input
          tabIndex="100"
          type="text"
          onChange={ ({target: {value}}) => navigate(value) }
          placeholder="Command name"
        />
      </section>
      <section className="github-stars">
        <GithubButton
          type="star"
          repository="tldr.jsx"
          user="ostera"
          count={true}
          size="large"
        />
      </section>
    </section>
  </nav>
)

