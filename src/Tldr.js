//@flow

/*******************************************************************************
 * Imports
 *******************************************************************************/

import type { History, Location } from 'history'

import type { Options as IndexOptions } from 'tldr/Index'
import type { Command } from 'tldr/Command'
import type { Page }    from 'tldr/Page'

/*******************************************************************************
 * Type Definitions
 *******************************************************************************/

type Debug = boolean

export type Package = {
  Version:  ?string;
  Revision: ?string;
}

export type Parameters = {
  _:        Package;
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
