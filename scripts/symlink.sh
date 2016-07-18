#!/bin/bash -e

pushd node_modules
  rm ./tldr
  ln -s ../src ./tldr
popd
