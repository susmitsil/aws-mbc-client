#!/bin/bash

REPODIR=~/aws-amb-client
LOCALCA=/home/ec2-user/managedblockchain-tls-chain.pem 

#copy the connection profiles
mkdir -p $REPODIR/tmp/connection-profile/org1
mkdir -p $REPODIR/tmp/connection-profile/org2
cp $REPODIR/asset-rest-api/connection-profile/asset-connection-profile-template.yaml $REPODIR/tmp/connection-profile/asset-connection-profile.yaml

cp $REPODIR/asset-rest-api/connection-profile/client-org1.yaml $REPODIR/tmp/connection-profile/org1

cp $REPODIR/asset-rest-api/connection-profile/client-org2.yaml $REPODIR/tmp/connection-profile/org2

#update the connection profiles with endpoints and other information
sed -i "s|%PEERNODEID%|$PEERNODEID|g" $REPODIR/tmp/connection-profile/asset-connection-profile.yaml
sed -i "s|%MEMBERID%|$MEMBERID|g" $REPODIR/tmp/connection-profile/asset-connection-profile.yaml
sed -i "s|%CAFILE%|$LOCALCA|g" $REPODIR/tmp/connection-profile/asset-connection-profile.yaml
sed -i "s|%ORDERINGSERVICEENDPOINT%|$ORDERINGSERVICEENDPOINT|g" $REPODIR/tmp/connection-profile/asset-connection-profile.yaml
sed -i "s|%ORDERINGSERVICEENDPOINTNOPORT%|$ORDERINGSERVICEENDPOINTNOPORT|g" $REPODIR/tmp/connection-profile/asset-connection-profile.yaml
sed -i "s|%PEERSERVICEENDPOINT%|$PEERSERVICEENDPOINT|g" $REPODIR/tmp/connection-profile/asset-connection-profile.yaml
sed -i "s|%PEERSERVICEENDPOINTNOPORT%|$PEERSERVICEENDPOINTNOPORT|g" $REPODIR/tmp/connection-profile/asset-connection-profile.yaml
sed -i "s|%PEEREVENTENDPOINT%|$PEEREVENTENDPOINT|g" $REPODIR/tmp/connection-profile/asset-connection-profile.yaml
sed -i "s|%CASERVICEENDPOINT%|$CASERVICEENDPOINT|g" $REPODIR/tmp/connection-profile/asset-connection-profile.yaml
sed -i "s|%ADMINUSER%|$ADMINUSER|g" $REPODIR/tmp/connection-profile/asset-connection-profile.yaml
sed -i "s|%ADMINPWD%|$ADMINPWD|g" $REPODIR/tmp/connection-profile/asset-connection-profile.yaml

sed -i "s|%PEERNODEIDORG2%|$PEERNODEIDORG2|g" $REPODIR/tmp/connection-profile/asset-connection-profile.yaml
sed -i "s|%MEMBERIDORG2%|$MEMBERIDORG2|g" $REPODIR/tmp/connection-profile/asset-connection-profile.yaml
sed -i "s|%CAFILEORG2%|$LOCALCAORG2|g" $REPODIR/tmp/connection-profile/asset-connection-profile.yaml
sed -i "s|%ORDERINGSERVICEENDPOINT%|$ORDERINGSERVICEENDPOINT|g" $REPODIR/tmp/connection-profile/asset-connection-profile.yaml
sed -i "s|%ORDERINGSERVICEENDPOINTNOPORT%|$ORDERINGSERVICEENDPOINTNOPORT|g" $REPODIR/tmp/connection-profile/asset-connection-profile.yaml
sed -i "s|%PEERSERVICEENDPOINTORG2%|$PEERSERVICEENDPOINTORG2|g" $REPODIR/tmp/connection-profile/asset-connection-profile.yaml
sed -i "s|%PEERSERVICEENDPOINTNOPORTORG2%|$PEERSERVICEENDPOINTNOPORTORG2|g" $REPODIR/tmp/connection-profile/asset-connection-profile.yaml
sed -i "s|%PEEREVENTENDPOINTORG2%|$PEEREVENTENDPOINTORG2|g" $REPODIR/tmp/connection-profile/asset-connection-profile.yaml
sed -i "s|%CASERVICEENDPOINTORG2%|$CASERVICEENDPOINTORG2|g" $REPODIR/tmp/connection-profile/asset-connection-profile.yaml
sed -i "s|%ADMINUSER%|$ADMINUSER|g" $REPODIR/tmp/connection-profile/asset-connection-profile.yaml
sed -i "s|%ADMINPWD%|$ADMINPWD|g" $REPODIR/tmp/connection-profile/asset-connection-profile.yaml

ls -lR $REPODIR/tmp/connection-profile