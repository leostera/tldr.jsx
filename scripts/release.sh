#!/bin/bash -e

make package
pushd dist
  s3cmd sync -P . s3://tldr.ostera.io
popd
