#!/bin/bash -xe

.bin/aws configure set preview.cloudfront true
.bin/aws cloudfront \
  create-invalidation \
  --distribution-id $AWS_CLOUDFRONT_DISTRIBUTION \
  --paths /index.html
