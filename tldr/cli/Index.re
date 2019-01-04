module IndexTbl =
  Hashtbl.Make({
    type t = Model.Command.name;
    let equal = String.equal;
    let hash = Hashtbl.hash;
  });

include Model.Index.Make({
  type t = IndexTbl.t(Model.Command.t);

  type io('a) = Lwt.t('a);

  let create = () => IndexTbl.create(0) |> Lwt.return;

  let lookup_by_name = (_index, _name) => Lwt.return(None);

  let page_for_command = _command => Lwt.return(Error(`Not_found));
});
