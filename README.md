
# AWS Managed Blockchain Client Implementation

## Setup an AWS Managed Blockchain Service

## Provide configuration details of AWS Blockchan Network on asset-fabric/cli/fabric-network.sh

## Execute following command to make all scripts executable

```bash
find ~/aws-mbc-client/ -type f -iname "*.sh" -exec chmod +x {} \;
```

## Export Network Configurations
```bash
cd ~/aws-mbc-client/asset-fabric
./start.sh
```

## Perform Channel Deployment

### Creating channel

```bash
docker exec cli configtxgen -outputCreateChannelTx /opt/home/$CHANNEL.pb -profile OneOrgChannel -channelID $CHANNEL --configPath /opt/home/

ls -lt ~/$CHANNEL.pb 

docker exec -e "CORE_PEER_TLS_ENABLED=true" -e "CORE_PEER_TLS_ROOTCERT_FILE=/opt/home/managedblockchain-tls-chain.pem" \
    -e "CORE_PEER_ADDRESS=$PEER" -e "CORE_PEER_LOCALMSPID=$MSP" -e "CORE_PEER_MSPCONFIGPATH=$MSP_PATH" \
    cli peer channel create -c $CHANNEL -f /opt/home/$CHANNEL.pb -o $ORDERER --cafile $CAFILE --tls --timeout 900s

ls -lt /opt/home/
```

### Fetching channel config

```bash
docker exec -e "CORE_PEER_TLS_ENABLED=true" -e "CORE_PEER_TLS_ROOTCERT_FILE=/opt/home/managedblockchain-tls-chain.pem"  \
    -e "CORE_PEER_ADDRESS=$PEER"  -e "CORE_PEER_LOCALMSPID=$MSP" -e "CORE_PEER_MSPCONFIGPATH=$MSP_PATH" \
    cli peer channel fetch oldest /opt/home/$CHANNEL.block \
    -c $CHANNEL -o $ORDERER --cafile /opt/home/managedblockchain-tls-chain.pem --tls

ls -lt /opt/home/
```

### Joining the channel

```bash
docker exec -e "CORE_PEER_TLS_ENABLED=true" -e "CORE_PEER_TLS_ROOTCERT_FILE=/opt/home/managedblockchain-tls-chain.pem" \
    -e "CORE_PEER_ADDRESS=$PEER" -e "CORE_PEER_LOCALMSPID=$MSP" -e "CORE_PEER_MSPCONFIGPATH=$MSP_PATH" \
    cli peer channel join -b $CHANNEL.block  -o $ORDERER --cafile $CAFILE --tls

mkdir /home/ec2-user/fabric-samples/chaincode/asset

cp ~/aws-mbc-client/asset-chaincode/src/* /home/ec2-user/fabric-samples/chaincode/asset/
```

### Installing the chaincode
```bash
docker exec -e "CORE_PEER_TLS_ENABLED=true" -e "CORE_PEER_TLS_ROOTCERT_FILE=/opt/home/managedblockchain-tls-chain.pem" \
    -e "CORE_PEER_LOCALMSPID=$MSP" -e "CORE_PEER_MSPCONFIGPATH=$MSP_PATH" -e "CORE_PEER_ADDRESS=$PEER"  \
    cli peer chaincode install -n $CHAINCODENAME -l node -v v0 -p $CHAINCODEDIR
```

### Instantiating the chaincode
```bash
docker exec -e "CORE_PEER_TLS_ENABLED=true" -e "CORE_PEER_TLS_ROOTCERT_FILE=/opt/home/managedblockchain-tls-chain.pem" \
    -e "CORE_PEER_LOCALMSPID=$MSP" -e "CORE_PEER_MSPCONFIGPATH=$MSP_PATH" -e "CORE_PEER_ADDRESS=$PEER"  \
    cli peer chaincode instantiate -o $ORDERER -C mychannel -n $CHAINCODENAME -v v0 -c '{"Args":["init"]}' --cafile /opt/home/managedblockchain-tls-chain.pem --tls
```

### Querying the chaincode
```bash
docker exec -e "CORE_PEER_TLS_ENABLED=true" -e "CORE_PEER_TLS_ROOTCERT_FILE=/opt/home/managedblockchain-tls-chain.pem" \
    -e "CORE_PEER_ADDRESS=$PEER" -e "CORE_PEER_LOCALMSPID=$MSP" -e "CORE_PEER_MSPCONFIGPATH=$MSP_PATH" \
    cli peer chaincode query -C $CHANNEL -n $CHAINCODENAME -c '{"Args":["queryAllAssets"]}'
```

### Invoking transactions on asset chaincode
```bash
docker exec -e "CORE_PEER_TLS_ENABLED=true" -e "CORE_PEER_TLS_ROOTCERT_FILE=/opt/home/managedblockchain-tls-chain.pem" \
    -e "CORE_PEER_ADDRESS=$PEER" -e "CORE_PEER_LOCALMSPID=$MSP" -e "CORE_PEER_MSPCONFIGPATH=$MSP_PATH" \
    cli peer chaincode invoke -o $ORDERER -C $CHANNEL -n $CHAINCODENAME \
    -c '{"Args":["createAsset","{\"assetOwnerName\":\"Rohit\", \"email\":\"rohit@bcasset.com\",\"assetName\": \"CAR 201\",\"assetId\": \"CAR201\",
      \"assetType\": \"car\",\"docType\":\"asset\",\"registeredDate\":\"2020-09-09T11:52:20.182Z\"}"]}' --cafile $CAFILE --tls

docker exec -e "CORE_PEER_TLS_ENABLED=true" -e "CORE_PEER_TLS_ROOTCERT_FILE=/opt/home/managedblockchain-tls-chain.pem" \
    -e "CORE_PEER_ADDRESS=$PEER" -e "CORE_PEER_LOCALMSPID=$MSP" -e "CORE_PEER_MSPCONFIGPATH=$MSP_PATH" \
    cli peer chaincode invoke -o $ORDERER -C $CHANNEL -n $CHAINCODENAME \
    -c '{"Args":["createAsset","{\"assetOwnerName\":\"Ravi\", \"email\":\"ravi@bcasset.com\",\"assetName\": \"CAR 202\",\"assetId\": \"CAR202\",
      \"assetType\": \"car\",\"docType\":\"asset\",\"registeredDate\":\"2020-09-09T11:52:20.182Z\"}"]}' --cafile $CAFILE --tls
```

### Querying the chaincode
```bash
docker exec -e "CORE_PEER_TLS_ENABLED=true" -e "CORE_PEER_TLS_ROOTCERT_FILE=/opt/home/managedblockchain-tls-chain.pem" \
    -e "CORE_PEER_ADDRESS=$PEER" -e "CORE_PEER_LOCALMSPID=$MSP" -e "CORE_PEER_MSPCONFIGPATH=$MSP_PATH" \
    cli peer chaincode query -C $CHANNEL -n $CHAINCODENAME -c '{"Args":["queryAsset","{\"assetId\":\"CAR201\"}"]}'
```

## Start REST API
```bash
cd ~/aws-mbc-client/aws-rest-api
./start.sh
```

## Test Asset Manager APIs
### Register/enroll a user
```bash
curl -s -X POST http://localhost:3000/users -H "content-type: application/x-www-form-urlencoded" -d 'username=susmit&orgName=Org1'
```

### Create an Asset
```bash
curl -s -X POST "http://localhost:3000/assets" -H "content-type: application/json" -d '{ 
   "assetOwnerName":"Nikhil",
   "email":"nikhil@bcasset.com",
   "assetName": "CAR 301",
   "assetId": "301",
   "assetType": "car",
   "registeredDate":"2018-10-22T11:52:20.182Z"
}'
```

### Fetch All Assets
```bash
curl -s -X GET   "http://localhost:3000/assets" -H "content-type: application/json"
```
