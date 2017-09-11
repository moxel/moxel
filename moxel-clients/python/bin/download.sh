#!/bin/bash
URL='http://beta.moxel.ai/release/cli/0.0.3'

for platform in osx linux windows
do
    mkdir -p $platform
    wget -O $platform/moxel $URL/$platform/moxel
    chmod +x $platform/moxel
done
