#!/bin/bash

rm -rf /tmp/fabric-client-kv-org1/
rm -rf fabric-client-kv-org1/
rm -rf /tmp/fabric-client-kv-org2/
rm -rf fabric-client-kv-org2/

cd connection-profile

./gen-connection-profile.sh

cd ../

nvm use lts/carbon

node app.js 