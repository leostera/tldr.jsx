type t = [ | `Common | `MacOS | `Linux | `Windows | `SunOS];

let platforms = [`Common, `MacOS, `Linux, `Windows, `SunOS];

let to_string =
  fun
  | `Common => "common"
  | `MacOS => "osx"
  | `Linux => "linux"
  | `Windows => "windows"
  | `SunOS => "sunos";

let of_string =
  fun
  | "common" => Some(`Common)
  | "osx" => Some(`MacOS)
  | "linux" => Some(`Linux)
  | "windows" => Some(`Windows)
  | "sunos" => Some(`SunOS)
  | _ => None;
