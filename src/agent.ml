type browser =
  | IE of string
  | CHROME of string
  | OPERA of string
  | FIREFOX of string
  | SAFARI of string
  | OTHER of string

type os =
  | LINUX of string
  | WINDOWS of string
  | MACOS of string
  | ANDROID of string
  | IOS of string
  | OTHER of string
