"""

ReasonML Build Rules

A set of rules for building ReasonML applications tightly integrating them with
Bazel. Based off Cheng Lou's Intro to Reason Compilation[0]

@author Leandro Ostera <leandro@ostera.io>

[0] https://github.com/chenglou/intro-to-reason-compilation/

"""

REASON_FILETYPE = "re"
REASON_FILETYPES = [REASON_FILETYPE]

ReasonModuleInfo = provider(fields = {

})


def _reason_module_impl(ctx):
  refile = ctx.files.src[0]

  runfiles = []
  for dep in ctx.attr.deps:
    runfiles.extend(dep.files.to_list())

  return [
    DefaultInfo(
      files=depset([refiles]),
      runfiles=ctx.runfiles(files=runfiles),
    ),
    ReasonModuleInfo(
      name=ctx.label.name,
      src=refile,
      cmx=cmfile,
      )
  ]

_reason_module = rule(
  attrs = {
    "src": attr.label(allow_files = REASON_FILETYPES, mandatory = True),
    "deps": attr.label_list(allow_files = False),
    "_reason_bins": attr.label(
      default = Label("@reason//:bin"),
      cfg = "host",
    ),
    "_ocaml_bins": attr.label(
      default = Label("@ocaml//:bin"),
      cfg = "host",
    )
  },
  implementation = _reason_module_impl
)

def reason_module(name, srcs, deps, **kwargs):
  _reason_module(
    name=name,
    srcs=srcs,
    deps=deps,
    **kwargs
  )
