load("//3rdparty/repos:utils.bzl", "download")

def nix_repositories(nix_version, nix_sha256):
  download(
      pkg = "io_tweag_rules_nixpkgs",
      org = "tweag",
      repo = "rules_nixpkgs",
      version = nix_version,
      sha256 = nix_sha256,
      ext = "tar.gz",
      )
