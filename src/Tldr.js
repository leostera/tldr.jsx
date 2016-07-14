//@flow

/*******************************************************************************
 * Imports
 *******************************************************************************/

import type { History, Location } from 'history'

import type { Options as IndexOptions } from './Index'
import type { Command } from './Command'
import type { Page } from './Page'

/*******************************************************************************
 * Type Definitions
 *******************************************************************************/

type Debug = boolean

export type Parameters = {
  command:  Command;
  debug?:   Debug;
  history:  History;
  index:    IndexOptions;
  location: Location;
}

export type State = {
  params: Parameters;
  found?: boolean;
  page?:  Page;
}
