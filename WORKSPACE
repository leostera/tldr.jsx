workspace(name = "tldr")

###
### Setup Bazel BuildTools repositories
###
load("//3rdparty/repos:bazel.bzl", "bazel_repositories")
bazel_repositories(
    skylib_version = "4eb28c458c610ceb5eace809a7049799808726dc",
    skylib_sha256 = "5e03a12820d8050817cdbfd4e19b28d86cbfdc4da27435ce1c5386709b3dd7c2",
    rules_go_version = "6627c61f391ec5e104b2f74a70fdab9fb6849821",
    rules_go_sha256 = "b4a926fdbcd26bf9c2ccde133678462a5b558c4c041ddf1632173e7a0b008e24",
    buildtools_version = "4fe6acf537e980ff6878a51e5894605be221224c",
    buildtools_sha256 = "43c2df6ce1bd01b4d8173efe0795b05b19240f24ea33fde3694096f7b6043f8a",
)

load("@io_bazel_rules_go//go:def.bzl", "go_rules_dependencies", "go_register_toolchains")
go_rules_dependencies()
go_register_toolchains()

###
### Nix Packages for local toolchains!
###
load("//3rdparty/repos:nix.bzl", "nix_repositories")
nix_repositories(
  nix_version = "cd2ed701127ebf7f8f21d37feb1d678e4fdf85e5",
  nix_sha256 = "084d0560c96bbfe5c210bd83b8df967ab0b1fcb330f2e2f30da75a9c46da0554",
)

###
### Setup ReasonML toolchain
###
load("//3rdparty/repos:reasonml.bzl", "reasonml_repositories")
reasonml_repositories()
