#!/bin/bash -e

readonly PROJECT=$(basename $(pwd))

pushd node_modules
  rm -f ./$PROJECT
  ln -s ../src ./$PROJECT
popd
