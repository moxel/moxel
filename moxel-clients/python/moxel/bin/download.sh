#!/bin/bash
URL='http://beta.moxel.ai/release/cli/latest'

for platform in osx linux windows
do
    mkdir -p $platform
    wget -O $platform/moxel $URL/$platform/moxel
    chmod +x $platform/moxel
done
