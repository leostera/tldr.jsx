//@flow

/*******************************************************************************
 * Imports
 *******************************************************************************/

import type { History } from 'history'

import type { Options as IndexOptions } from './Index'
import type { Command } from './Command'
import type { Page } from './Page'

/*******************************************************************************
 * Type Definitions
 *******************************************************************************/

type Debug = boolean

export type Parameters = {
  history: History;
  index:   IndexOptions;
  command: Command;
  debug?:  Debug;
}

export type State = {
  params: Parameters;
  found?: boolean;
  page?:  Page;
}
