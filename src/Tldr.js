//@flow

import type { History } from 'history'

import type { Options as IndexOptions } from './Index'
import type { Command } from './Command'

type Debug = boolean

export type Parameters = {
  history: History;
  index:   IndexOptions;
  command: Command;
  debug?:  Debug;
}

export type State = {
  params: Parameters
}
