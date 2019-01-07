%token <string> TITLE
%token <string> DESC
%token <string> EXAMPLE_DESC
%token <string> EXAMPLE_GIST
%token EOF

%start <Page.Parser.t option> page

%%

page:
  | EOF       { None }
  | v = value { Some v  }
  ;

value:
  | t = TITLE         { `Title(t) }
  | d = DESC          { `Desc(d) }
  | eg = EXAMPLE_GIST { `Example_gist(eg) }
  | ed = EXAMPLE_DESC { `Example_desc(ed) }
  ;

%%
