type ord = GT | EQ | LT

let cmp a b : ord = match (compare a b) with
  | -1 -> LT
  | 1 -> GT
  | _ -> EQ

let split (s : string) : char list =
  let rec split' (s' : string) (i : int) =
    match i with
    | 0 -> []
    | _ -> List.append [String.get s' (i-1)] (split' s' (i-1))
  in
  List.rev (split' s (String.length s))

let distance (x : string) (y : string) : int =
  let rec distance' a b =
    match (a, b) with
    | ([], _) -> 0
    | (_, []) -> 0
    | (x::xs, y::ys) ->
        match (x == y) with
        | true -> 0 + distance' xs ys
        | false -> 1 + distance' xs ys
  in
  let xs = split x in
  let xs_len = List.length xs in
  let ys = split y in
  let ys_len = List.length ys in
  let diff = match cmp xs_len ys_len with
    | LT -> ys_len - xs_len
    | EQ -> 0
    | GT -> xs_len - ys_len
  in
  diff + (distance' xs ys)
