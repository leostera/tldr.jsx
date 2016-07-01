//@flow

/*******************************************************************************
 * Type Definitions
 *******************************************************************************/

export type Platform = 'common' | 'linux' | 'osx' | 'sunos'

export type Command = {
  name:     string;
  platform: Platform;
}

