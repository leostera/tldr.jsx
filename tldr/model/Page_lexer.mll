{
  module L = Lexing
  exception SyntaxError of string
}

(* Prelude *)
let backtick = '`'
let digit = ['0'-'9']
let alpha = ['a'-'z' 'A'-'Z']
let sep = ['-' '_' '.' ',' ':']
let white = [' ' '\t']
let newline = '\r' | '\n' | "\r\n"
let doublequote = '"'
let star = "*"
let bang = "!"

let paren_open = "("
let paren_close = ")"
let brace_open = "{{"
let brace_close = "}}"

let symbol = (star|bang|sep|doublequote|paren_open|paren_close)
let text = (alpha|digit|white|symbol)+
let slot = brace_open text brace_close

(* Tldr Page Specific *)
let title = "#" text
let desc = ("> " text newline)+
let example_desc = "- " text
let example_gist = (text|slot)+

rule token =
  parse
  | white        { token lexbuf }
  | backtick     { token lexbuf }
  | newline      { L.new_line lexbuf; token lexbuf }
  | title        { `Title (L.lexeme lexbuf) }
  | desc         { `Desc(L.lexeme lexbuf) }
  | example_desc { `Example_desc(L.lexeme lexbuf) }
  | example_gist { `Example_gist(L.lexeme lexbuf) }
  | _            { raise (SyntaxError(Lexing.lexeme lexbuf)) }
  | eof          { `EOF }
