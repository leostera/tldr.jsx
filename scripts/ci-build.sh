#!/bin/bash -xe

readonly LAST_BUILD_JOB=$(travis show | tail -n 1 | awk '{ print $1 }' | sed 's/#//')

travis compile ${LAST_BUILD_JOB} > ${BUILD_SCRIPT}

readonly IMAGE=quay.io/travisci/travis-node-js
readonly BUILD_SCRIPT=$(pwd)/.build.sh
#!/bin/bash -xe

readonly IMAGE=quay.io/travisci/travis-node-js
docker run \
  -ti \
  --entrypoint=/opt/build.sh \
  -v $(pwd)/.travis_build:/root/build \
  -v ${HOME}/.ssh/id_rsa:/root/.ssh/id_rsa \
  -v $(pwd)/.build.sh:/opt/build.sh \
  ${IMAGE}
