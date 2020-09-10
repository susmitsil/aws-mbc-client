#!/bin/bash

aws configure

cd ~/aws-mbc-client/asset-fabric
source cli/fabric-network.sh

docker-compose -f docker-compose-cli.yaml up -d

aws s3 cp s3://ap-southeast-1.managedblockchain/etc/managedblockchain-tls-chain.pem  /home/ec2-user/managedblockchain-tls-chain.pem

cp ~/aws-mbc-client/asset-fabric/configtx.yaml ~
sed -i "s|__MEMBERID1__|$MEMBERID|g" ~/configtx.yaml
sed -i "s|__MEMBERID2__|$MEMBERIDORG2|g" ~/configtx.yaml
