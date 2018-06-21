reason_module(
    name = "tldr",
    srcs = glob(["*.re"]),
    )

bs_module(
    name = "src",
    config = "//:bs_config",
    srcs = [ ":tldr" ],
    deps = [ "//src/Effect", "//src/Coax", "//src/Model" ],
    )
