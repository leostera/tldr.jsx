#!/bin/bash -e

readonly IMAGE=quay.io/travisci/travis-node-js
readonly LAST_BUILD_JOB=$(travis show | tail -n 1 | awk '{ print $1 }' | sed 's/#//')
readonly BUILD_SCRIPT=$(pwd)/.build.sh

try docker pull ${IMAGE}
travis compile ${LAST_BUILD_JOB} > ${BUILD_SCRIPT}
docker run -ti --rm --entrypoint=/opt/build.sh -v ${BUILD_SCRIPT}:/opt/build.sh ${IMAGE}
