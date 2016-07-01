export default (a: Array) => {
  return a.filter((b) => {
    return !(b === null || b === undefined || (b.length !== undefined && b.length === 0))
  })
}
