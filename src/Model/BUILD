reason_module(
    name = "srcs",
    srcs = glob(["*.re"]),
    )

bs_module(
    visibility = ["//src:__subpackages__"],
    name = "Model",
    config = "//:bs_config",
    srcs = [ ":srcs" ],
    )
