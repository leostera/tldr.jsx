load("//3rdparty/repos:utils.bzl", "download")

def bazel_repositories(skylib_version,
                       skylib_sha256,
                       buildtools_version,
                       buildtools_sha256,
                       rules_go_version,
                       rules_go_sha256):
  download(
      pkg = "bazel_skylib",
      org = "bazelbuild",
      repo = "bazel-skylib",
      sha256 = skylib_sha256,
      version = skylib_version,
      ext = "zip"
      )

  download(
      pkg = "io_bazel_rules_go",
      org = "bazelbuild",
      repo = "rules_go",
      sha256 = rules_go_sha256,
      version = rules_go_version,
      ext = "zip"
      )

  download(
      pkg = "com_github_bazelbuild_buildtools",
      org = "bazelbuild",
      repo = "buildtools",
      sha256 = buildtools_sha256,
      version = buildtools_version,
      ext = "zip"
      )
