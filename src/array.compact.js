export default (a: Array) =>
  a.filter( b =>
    !(b === null || b === undefined || (b.length !== undefined && b.length === 0))
  )
