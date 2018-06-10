load("//tools/build_rules:reasonml.bzl", "reason_module", "bs_module")

reason_module(
  name = "model",
  srcs = ["Model.re"],
  deps = [":app"]
)

reason_module(
  name = "app",
  srcs = ["App.re"],
  deps = []
)

bs_module(
   name = "src",
   config = "//:bs_config",
   srcs = [ ":model" ],
   deps = []
   )
