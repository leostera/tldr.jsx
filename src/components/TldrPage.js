import type { Page } from '../Page'

import marked from 'marked'

export default ({body, path}: Page) => (
  <section className="content page" dangerouslySetInnerHTML={{__html: marked(body)}}>
  </section>
)
