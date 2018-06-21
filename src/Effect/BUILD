reason_module(
    name = "srcs",
    srcs = glob(["*.re"]),
    )

bs_module(
    visibility = ["//src:__subpackages__"],
    name = "Effect",
    config = "//:bs_config",
    srcs = [ ":srcs" ],
    deps = [ "//src/Model", "//src/Coax" ],
    )
