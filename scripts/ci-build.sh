#!/bin/bash -xe

readonly IMAGE=quay.io/travisci/travis-node-js

docker run \
  -ti \
  --entrypoint=/opt/build.sh \
  -v $(pwd)/.travis_build:/root/build \
  -v ${HOME}/.ssh/id_rsa:/root/.ssh/id_rsa \
  -v $(pwd)/build/ci.sh:/opt/build.sh \
  ${IMAGE}
