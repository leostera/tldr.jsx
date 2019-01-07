module Command = Command;
module Page = Page;
module Platform = Platform;

let index_repo =
  Github.Repo.make(~owner="tldr-pages", ~name="tldr-pages.github.io");

let data_repo = Github.Repo.make(~owner="tldr-pages", ~name="tldr");
