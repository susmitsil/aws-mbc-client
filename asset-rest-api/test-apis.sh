#!/bin/bash

# Register/enroll a user
curl -s -X POST http://localhost:3000/users -H "content-type: application/x-www-form-urlencoded" -d 'username=susmit&orgName=Org1'


# Create an asset
curl -s -X POST "http://localhost:3000/assets" -H "content-type: application/json" -d '{ 
   "assetOwnerName":"Nikhil",
   "email":"nikhil@bcasset.com",
   "assetName": "CAR 301",
   "assetId": "301",
   "assetType": "car",
   "registeredDate":"2018-10-22T11:52:20.182Z"
}'

# Fetch all assets
curl -s -X GET   "http://localhost:3000/assets" -H "content-type: application/json"