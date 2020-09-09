
'use strict';
const shim = require('fabric-shim');
const util = require('util');

/**
 * Executes a query based on a provided key
 */
async function queryByKey(stub, key) {
  console.log('============= START : queryByKey ===========');
  console.log('##### queryByKey key: ' + key);

  let resultAsBytes = await stub.getState(key); 
  if (!resultAsBytes || resultAsBytes.toString().length <= 0) {
    throw new Error('##### queryByKey key: ' + key + ' does not exist');
  }
  console.log('##### queryByKey response: ' + resultAsBytes);
  console.log('============= END : queryByKey ===========');
  return resultAsBytes;
}

/**
 * Executes a query based on a provided queryString
 */
async function queryByString(stub, queryString) {
  console.log('============= START : queryByString ===========');
  console.log("##### queryByString queryString: " + queryString);

  let docType = "";
  let startKey = "";
  let endKey = "";
  let jsonQueryString = JSON.parse(queryString);
  if (jsonQueryString['selector'] && jsonQueryString['selector']['docType']) {
    docType = jsonQueryString['selector']['docType'];
    startKey = docType + "0";
    endKey = docType + "z";
  }
  else {
    throw new Error('##### queryByString - Cannot call queryByString without a docType element: ' + queryString);   
  }

  let iterator = await stub.getStateByRange(startKey, endKey);

  // Iterator handling is identical for both CouchDB and LevelDB result sets, with the 
  // exception of the filter handling in the commented section below
  let allResults = [];
  while (true) {
    let res = await iterator.next();

    if (res.value && res.value.value.toString()) {
      let jsonRes = {};
      console.log('##### queryByString iterator: ' + res.value.value.toString('utf8'));

      jsonRes.Key = res.value.key;
      try {
        jsonRes.Record = JSON.parse(res.value.value.toString('utf8'));
      } 
      catch (err) {
        console.log('##### queryByString error: ' + err);
        jsonRes.Record = res.value.value.toString('utf8');
      }
      // ******************* LevelDB filter handling ******************************************
      // LevelDB: additional code required to filter out records we don't need
      // Check that each filter condition in jsonQueryString can be found in the iterator json
      // If we are using CouchDB, this isn't required as rich query supports selectors
      let jsonRecord = jsonQueryString['selector'];
      // If there is only a docType, no need to filter, just return all
      console.log('##### queryByString jsonRecord - number of JSON keys: ' + Object.keys(jsonRecord).length);
      if (Object.keys(jsonRecord).length == 1) {
        allResults.push(jsonRes);
        continue;
      }
      for (var key in jsonRecord) {
        if (jsonRecord.hasOwnProperty(key)) {
          console.log('##### queryByString jsonRecord key: ' + key + " value: " + jsonRecord[key]);
          if (key == "docType") {
            continue;
          }
          console.log('##### queryByString json iterator has key: ' + jsonRes.Record[key]);
          if (!(jsonRes.Record[key] && jsonRes.Record[key] == jsonRecord[key])) {
            // we do not want this record as it does not match the filter criteria
            continue;
          }
          allResults.push(jsonRes);
        }
      }
      // ******************* End LevelDB filter handling ******************************************
      // For CouchDB, push all results
      // allResults.push(jsonRes);
    }
    if (res.done) {
      await iterator.close();
      console.log('##### queryByString all results: ' + JSON.stringify(allResults));
      console.log('============= END : queryByString ===========');
      return Buffer.from(JSON.stringify(allResults));
    }
  }
}

/************************************************************************************************
 * 
 * CHAINCODE
 * 
 ************************************************************************************************/

let Chaincode = class {

  /**
   * Initialize the state when the chaincode is either instantiated or upgraded
   * 
   * @param {*} stub 
   */
  async Init(stub) {
    console.log('=========== Init: Instantiated / Upgraded asset chaincode ===========');

    var i=1;
    while(i<6){
      // args is passed as a JSON string
      let json = {"assetOwnerName":"Susmit", "email":"susmit@bcasset.com","assetName": "CAR "+(100*i),"assetId": "CAR"+(100*i),
      "assetType": "car","docType":"asset","registeredDate":"2020-09-09T11:52:20.182Z"};
        
      let key = json['assetId'];
      
      await stub.putState(key, Buffer.from(JSON.stringify(json)));
      i=i+1;
    }
    

    return shim.success();
  }

  /**
   * The Invoke method will call the methods below based on the method name passed by the calling
   * program.
   * 
   * @param {*} stub 
   */
  async Invoke(stub) {
    console.log('============= START : Invoke ===========');
    let ret = stub.getFunctionAndParameters();
    console.log('##### Invoke args: ' + JSON.stringify(ret));

    let method = this[ret.fcn];
    if (!method) {
      console.error('##### Invoke - error: no chaincode function with name: ' + ret.fcn + ' found');
      throw new Error('No chaincode function with name: ' + ret.fcn + ' found');
    }
    try {
      let response = await method(stub, ret.params);
      console.log('##### Invoke response payload: ' + response);
      return shim.success(response);
    } catch (err) {
      console.log('##### Invoke - error: ' + err);
      return shim.error(err);
    }
  }

  /**
   * Initialize the state. This should be explicitly called if required.
   * 
   * @param {*} stub 
   * @param {*} args 
   */
  async initLedger(stub, args) {
    console.log('============= START : Initialize Ledger ===========');
    console.log('============= END : Initialize Ledger ===========');
  }

  /************************************************************************************************
   * 
   * Donor functions 
   * 
   ************************************************************************************************/

   /**
   * Creates a new asset
   * 
   * @param {*} stub 
   * @param {*} args - JSON as follows:
   * {
   *    "assetOwnerName":"sam",
   *    "email":"sam@bcasset.com",
   *    "assetName": "CAR 201",
   *    "assetId": "201",
   *    "assetType": "car",
   *    "registeredDate":"2018-10-22T11:52:20.182Z"
   * }
   */
  async createAsset(stub, args) {
    console.log('============= START : createAsset ===========');
    console.log('##### createAsset arguments: ' + JSON.stringify(args));

    // args is passed as a JSON string
    let json = JSON.parse(args);
    let key = json['assetId'];
    json['docType'] = 'asset';

    console.log('##### createAsset payload: ' + JSON.stringify(json));

    // Check if the donor already exists
    let assetQuery = await stub.getState(key);
    if (assetQuery.toString()) {
      throw new Error('##### createAsset - This asset already exists: ' + json['assetId']);
    }

    await stub.putState(key, Buffer.from(JSON.stringify(json)));
    console.log('============= END : createAsset ===========');
  }

  /**
   * Retrieves a specfic donor
   * 
   * @param {*} stub 
   * @param {*} args 
   */
  async queryAsset(stub, args) {
    console.log('============= START : queryAsset ===========');
    console.log('##### queryDonor arguments: ' + JSON.stringify(args));

    // args is passed as a JSON string
    let json = JSON.parse(args);
    let key = json['assetId'];
    console.log('##### queryAsset key: ' + key);

    return queryByKey(stub, key);
  }

  /**
   * Retrieves all donors
   * 
   * @param {*} stub 
   * @param {*} args 
   */
  async queryAllAssets(stub, args) {
    console.log('============= START : queryAllDonors ===========');
    console.log('##### queryAllDonors arguments: ' + JSON.stringify(args));
 
    let queryString = '{"selector": {"docType": "asset"}}';
    return queryByString(stub, queryString);
  }

  /************************************************************************************************
   * 
   * Donation functions 
   * 
   ************************************************************************************************/

  /**
   * Creates a new Donation
   * 
   * @param {*} stub 
   * @param {*} args - JSON as follows:
   * {
   *    "assetOwnerName":"sam",
   *    "email":"sam@bcasset.com",
   *    "assetName": "CAR 201",
   *    "assetId": "201",
   *    "assetType": "car",
   *    "registeredDate":"2018-10-22T11:52:20.182Z"
   * }
   */
  async changeOwner(stub, args) {
    console.log('============= START : changeOwner ===========');
    console.log('##### changeOwner arguments: ' + JSON.stringify(args));

    // args is passed as a JSON string
    let json = JSON.parse(args);
    let key = json['assetId'];
    
    console.log('##### changeOwner: ' + JSON.stringify(json));

    // Check if the asset already exists
    let assetQuery = await stub.getState(key);
    if (!assetQuery.toString()) {
      throw new Error('##### changeOwner - This asset doesnot exists: ' + key);
    }

    await stub.putState(key, Buffer.from(JSON.stringify(json)));
    console.log('============= END : changeOwner ===========');
  }

  /**
   * Retrieves the Fabric block and transaction details for a key or an array of keys
   * 
   * @param {*} stub 
   * @param {*} args - JSON as follows:
   * [
   *    {"key": "a207aa1e124cc7cb350e9261018a9bd05fb4e0f7dcac5839bdcd0266af7e531d-1"}
   * ]
   * 
   */
  async queryHistoryForKey(stub, args) {
    console.log('============= START : queryHistoryForKey ===========');
    console.log('##### queryHistoryForKey arguments: ' + JSON.stringify(args));

    // args is passed as a JSON string
    let json = JSON.parse(args);
    let key = json['key'];
    let docType = json['docType']
    console.log('##### queryHistoryForKey key: ' + key);
    let historyIterator = await stub.getHistoryForKey(docType + key);
    console.log('##### queryHistoryForKey historyIterator: ' + util.inspect(historyIterator));
    let history = [];
    while (true) {
      let historyRecord = await historyIterator.next();
      console.log('##### queryHistoryForKey historyRecord: ' + util.inspect(historyRecord));
      if (historyRecord.value && historyRecord.value.value.toString()) {
        let jsonRes = {};
        console.log('##### queryHistoryForKey historyRecord.value.value: ' + historyRecord.value.value.toString('utf8'));
        jsonRes.TxId = historyRecord.value.tx_id;
        jsonRes.Timestamp = historyRecord.value.timestamp;
        jsonRes.IsDelete = historyRecord.value.is_delete.toString();
      try {
          jsonRes.Record = JSON.parse(historyRecord.value.value.toString('utf8'));
        } catch (err) {
          console.log('##### queryHistoryForKey error: ' + err);
          jsonRes.Record = historyRecord.value.value.toString('utf8');
        }
        console.log('##### queryHistoryForKey json: ' + util.inspect(jsonRes));
        history.push(jsonRes);
      }
      if (historyRecord.done) {
        await historyIterator.close();
        console.log('##### queryHistoryForKey all results: ' + JSON.stringify(history));
        console.log('============= END : queryHistoryForKey ===========');
        return Buffer.from(JSON.stringify(history));
      }
    }
  }
}
shim.start(new Chaincode());
