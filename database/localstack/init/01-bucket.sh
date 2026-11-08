#!/bin/sh
awslocal s3 mb "s3://${S3_BUCKET:-gaya-images}" || true
