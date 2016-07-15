#!/bin/bash -xe

readonly IMAGE=quay.io/travisci/travis-node-js

readonly STAMP=$(git rev-parse --abbrev-ref HEAD)@$(git rev-parse HEAD).$(date +%s)

docker run \
  -ti \
  --entrypoint=/opt/build.sh \
  -v $(pwd)/.travis_build/${STAMP}:/root/build \
  -v ${HOME}/.ssh/id_rsa:/root/.ssh/id_rsa \
  -v $(pwd)/build/ci.sh:/opt/build.sh \
  ${IMAGE}
