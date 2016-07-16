#!/bin/bash -xe

readonly BUILD_DIR=$(pwd)/.travis_build
readonly IMAGE=quay.io/travisci/travis-node-js

readonly BRANCH=$(git rev-parse --abbrev-ref HEAD)
readonly REF=$(git rev-parse HEAD)
readonly TIME=$(date +%s)
readonly STAMP=${BRANCH}@${REF}.${TIME}

mkdir -p ${BUILD_DIR}

travis compile $(travis show | tail -n 1 | awk '{ print $1 }' | sed 's/#//') > ${BUILD_DIR}/ci.sh
sed -i "/branch/s#\\\'\\\'#\\\'${BRANCH}\\\'#" ${BUILD_DIR}/ci.sh
chmod +x ${BUILD_DIR}/ci.sh

docker run \
  -ti \
  --entrypoint=/opt/build.sh \
  -v ${BUILD_DIR}/${STAMP}:/root/build \
  -v ${HOME}/.ssh/id_rsa:/root/.ssh/id_rsa \
  -v ${BUILD_DIR}/ci.sh:/opt/build.sh \
  ${IMAGE}
