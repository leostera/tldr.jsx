import Tldr from './Tldr'

export default ({navigate}) => (
  <nav>
    <Tldr /> 
    <input
      type="text"
      onChange={ ({target: {value}}) => navigate(value) }
      placeholder="Command name"
    />
  </nav>
)

