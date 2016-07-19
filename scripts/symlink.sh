#!/bin/bash -e

pushd node_modules
  rm -f ./tldr
  ln -s ../src ./tldr
popd
