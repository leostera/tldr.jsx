#!/bin/bash -e

pushd dist
  aws s3 sync . s3://tldr.ostera.io
popd
