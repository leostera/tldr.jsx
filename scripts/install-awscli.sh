#!/bin/bash -xe

clean() {
  rm -rf awscli-bundle{,.zip}
}

clean
trap clean EXIT;

wget https://s3.amazonaws.com/aws-cli/awscli-bundle.zip
unzip awscli-bundle.zip
./awscli-bundle/install -b .bin/aws
