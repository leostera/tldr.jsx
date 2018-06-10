################################################################################
#
# ReasonML Rules
#
# A set of rules for building ReasonML applications tightly integrating them
# with Bazel. Based off Cheng Lou's Intro to Reason Compilation[0]
#
# @author Leandro Ostera <leandro@ostera.io>
#
# [0] https://github.com/chenglou/intro-to-reason-compilation/
#
################################################################################

BINARY_FILETYPE = ".ml_bin"
BUCKLESCRIPT_FILETYPES = [".ml", ".mli", BINARY_FILETYPE]
BUCKLESCRIPT_OUTPUT_FILETYPE = ".bs.js"
BS_CONFIG_FILETYPE = [".json"]
REASON_FILETYPES = [".re", ".rei"]

ReasonModuleInfo = provider(fields = {
  "name": "the name of the module",
  "src": "the source file for this module",
  "out": "the compiled file for this module (binary code)",
  "type": "type can be binary, javascript, or native"
})

def reason_compile(ctx, refmt, src, out, deps):
  """
  Helper function used to print a source ReasonML file into the binary representation.

  This binary representation can then be used to compile back to Reason, compile to Javascript, to Ocaml, or straight into Ocaml bytecode, optimized native code, or even web assembly.

  @ctx    is a context object
  @refmt  is a binary file for the refmt tool
  @src    is the source ReasonML file
  @out    is the output binary file
  @deps   is a list of dependencies that should retrigger this action
  """
  command = "{refmt} --print binary {src} > {out}".format(
      refmt = refmt.path,
      src = src.path,
      out = out.path,
      )

  inputs = [src]
  for d in deps:
    inputs.extend(d.files.to_list())

  ctx.actions.run_shell(
    env = { "HOME": ctx.workspace_name },
    command = command,
    inputs = depset(inputs),
    outputs = [out],
    tools = [refmt],
    mnemonic = "ReasonCompile",
    progress_message = "Compiling {src} to {out}".format(
      src=src.path,
      out=out.path
      ),
    )

def _reason_module_impl(ctx):
  # We only take one file per module, since one file _is_ one module
  refile = ctx.files.srcs[0]

  binfile = ctx.actions.declare_file(
    refile.basename + BINARY_FILETYPE
  )

  reason_compile(
    ctx=ctx,
    refmt=ctx.file._refmt_bin,
    src=refile,
    out=binfile,
    deps=ctx.attr.deps,
    )

  # room for dependencies that will be needed whenever this file is required
  runfiles = []
  for dep in ctx.attr.deps:
    runfiles.extend(dep.files.to_list())

  return [
    DefaultInfo(
      files=depset([binfile]),
      runfiles=ctx.runfiles(files=runfiles),
    ),
    ReasonModuleInfo(
      name=ctx.label.name,
      src=refile,
      out=binfile,
      type="binary",
      )
  ]

"""
A reason_module is a ReasonML file that will be compiled down to a binary
AST representation for further processing.
"""
reason_module = rule(
  attrs = {
    "srcs": attr.label_list(allow_files = REASON_FILETYPES, mandatory = True),
    "deps": attr.label_list(allow_files = False),
    "_refmt_bin": attr.label(
      default = Label("//3rdparty/bucklescript:refmt.exe"),
      allow_single_file = True,
      executable = True,
      cfg = "host",
    ),
  },
  implementation = _reason_module_impl
)


################################################################################
#
# BuckleScript Rules
#
################################################################################

def _bs_module_impl(ctx):
  # We only take one file per module, since one file _is_ one module
  refile = ctx.files.srcs[0]

  binfile = ctx.actions.declare_file(
    refile.basename.replace(BINARY_FILETYPE, BUCKLESCRIPT_OUTPUT_FILETYPE)
  )

  arguments = [
      "-bs-super-errors",
      "-bs-diagnose",
      "-color", "always",
      "-absname",
      "-bs-D", "DEBUG=true",

      # TODO(@ostera): make this configurable by a provider
      "-bs-g", # save debugging information,

      # TODO(@ostera): declare annotations as files as well
      "-bin-annot",

      # TODO(@ostera): make this configurable, we don't need it by default
      "-bs-package-name", ctx.attr.name,

      # TODO(@ostera): this should be configurable from another rule
      # in essence this modules will not determine what the full bundle
      # compiles to, but the other way around
      "-bs-package-output", "commonjs:{outdir}".format(
          outdir = binfile.dirname,
          ),

      # Imports, includes current module and pervasives
      "-I", "{outdir}".format(
          outdir = binfile.dirname,
          ),

      "-I", ctx.files._stdlib[0].dirname,

      # Output falgs
      "-o", binfile.path,

      # Input flags
      "-c",
      # TODO(@ostera): Repeat these last bit for multiple sources
      "-impl", refile.path
      ]

  print(arguments)

  inputs = [ctx.file.config]
  for i in ctx.attr.srcs:
    inputs.extend(i.files.to_list())
  inputs.extend(ctx.files._stdlib)

  ctx.actions.run(
    arguments = arguments,
    env = { "HOME": ctx.workspace_name },
    executable = ctx.file._bsc_bin,
    inputs = depset(inputs),
    outputs = [binfile],
    mnemonic = "BuckleScriptCompile",
    progress_message = "Compiling {_in} to {out}".format(
      _in=refile.basename,
      out=binfile.basename
      ),
    )

  runfiles = []
  for dep in ctx.attr.deps:
    runfiles.extend(dep.files.to_list())
  runfiles.extend(ctx.files._stdlib)

  return [
    DefaultInfo(
      files=depset([binfile]),
      runfiles=ctx.runfiles(files=runfiles),
    ),
  ]

bs_module = rule(
    attrs = {
        "config": attr.label(
            allow_files = BS_CONFIG_FILETYPE,
            single_file = True,
            mandatory = True,
            ),
        "srcs": attr.label_list(
            allow_files = BUCKLESCRIPT_FILETYPES,
            mandatory = True,
            ),
        "deps": attr.label_list(allow_files = False),
        "_stdlib": attr.label(
            default = Label("//3rdparty/bucklescript:stdlib.ml"),
            ),
        "_bsc_bin": attr.label(
            default = Label("//3rdparty/bucklescript:bsc.exe"),
            allow_single_file = True,
            executable = True,
            cfg = "host",
            ),
        },
    implementation = _bs_module_impl
    )
