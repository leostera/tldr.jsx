import React from 'react'

const Tldr = ({size}) => {
  let className=`brand ${size}`
  return (<a className={className} href="//tldr-pages.github.io"/>)
}

export default Tldr
