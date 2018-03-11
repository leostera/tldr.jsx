type query = Query of string

type context = Ctx of Agent.browser * Agent.os

type actions =
  | Bootstrap
  | Search of query * context
