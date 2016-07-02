import Tldr from './Tldr'
import hello from '../lib/hello'

let random = (list) => list[Math.floor(Math.random()*list.length)]

const Welcome = () => (
  <section className="content">
      <h1>{random(hello)}!</h1>
      <p> We tried to learn other languages, but we didn't find a <Tldr size="small"/> for them.  </p>
      <p> It might not look good, so we extend our deepest apologies. </p>
  </section>
)

export default { Welcome }
