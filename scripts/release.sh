#!/bin/bash -e

export NODE_ENV=production

make package
pushd dist
  s3cmd sync -P . s3://tldr.ostera.io
popd
