import React from 'react'

import Tldr from './Tldr'

export default ({navigate}) => (
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

