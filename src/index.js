// @FlowIgnore
import 'whatwg-fetch'

import type {
  Type,
} from 'zazen/type'

/*
 * Data
 */
type Query = string

/*
 * Messages
 */
type SearchT = Type<'Search', Query>

const Search: Data<SearchT, Query> = type('Search')

type MessagesT = SearchT
const messageId: TypeChecker<MessagesT> = x => x
const match = createMatch(messageId)

const handle = match({
  Search: x => x,
})
