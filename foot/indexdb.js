/**-----------------**-----------------**-----------------**
 Copyright (c) 2007-2016, MORITA Shintaro, Sysphonic. All rights reserved.
   http://sysphonic.com/
 This module is released under New BSD License.
 **-----------------**-----------------**-----------------**/

var rxw = "readwrite";

function ixDatabase(db)
{
  this.name = String(db.name);
  this.version = db.version;
  this.stores = [];
}

function ixStore(oDatabase, store)
{
  this.db = oDatabase;
  this.name = String(store.name);
  this.keyPath = store.keyPath;
  this.fieldNames = [String(this.keyPath)];
  this.indices = [];
  this.records = [];

  for (var i=0; i < store.indexNames.length; i++) {
    var indexName = store.indexNames.item(i);
    var index = store.index(indexName);
    this.indices.push(new ixIndex(index));
  }
  this.indices.sort(function(a, b){return (((a.unique)?0:1) - ((b.unique)?0:1))});

  for (var i=0; i < this.indices.length; i++) {
    var oIndex = this.indices[i];
    this.fieldNames.push(String(oIndex.keyPath));
  }
  var oStore = this;
  this.addRecord = function(rec) {
    this.records.push(new ixRecord(rec, oDatabase, oStore));
  };
  return this;
}

function ixIndex(index)
{
  this.name = String(index.name);
  this.keyPath = index.keyPath;
  this.unique = index.unique;

  return this;
}

function ixRecord(rec, oDatabase, oStore)
{
  this.db = oDatabase;
  this.store = oStore;
  this.attrs = {};
  this.updateAttrs = function(attrs) {
    for (var attr in attrs) {
      this.attrs[attr] = attrs[attr];
    }
    var keyPath = oStore.keyPath;
    this.keyPathVal = this.attrs[keyPath];
  };
  this.updateAttrs(rec);
  return this;
}

function ixGetIndexDb()
{
  var oIndexDb = null;
  if (window.indexedDB) {
     oIndexDb = window.indexedDB
  }
  return oIndexDb;
}

function ixOpenDb(dbName, dbVer, execFunc, execArgs)
{
  var oIndexDb = ixGetIndexDb();
  if (oIndexDb == null) {
     return false;
  }

  var db = null; 

  var req = null;
  if (dbVer == null) {
    req = oIndexDb.open(dbName);
  } else {
    req = oIndexDb.open(dbName, dbVer);
  }
  req.onsuccess = function(evt) {
    db = evt.target.result;
    if (execFunc) {
      execFunc(db, execArgs);
    }
  };
//req.onerror = failureHandler();
//req.onblocked = blockedHandler();
//req.onupgradeneeded = function(evt) {};
  return true;
}


var clearStoresReqIdx = 0;
var clearStores_h = {};

function ixClearStores(stores, onsuccess)
{
  if (stores.length > 0) {
    var reqIdx = clearStoresReqIdx++;
    clearStores_h[reqIdx] = stores.length;
    for (var i=0; i < stores.length; i++) {
      var req = stores[i].clear();
      req.onsuccess = function(evt) {
        if ((--clearStores_h[reqIdx] == 0) && onsuccess) {
          onsuccess();
        }
      };
    }
  } else {
    if (onsuccess) {
      onsuccess();
    }
  }
}

function ixDeleteDb(dbName, execFunc)
{
  var oIndexDb = ixGetIndexDb();
  if (oIndexDb == null) {
     return false;
  }
  var req = oIndexDb.deleteDatabase(dbName);
  req.onsuccess = function(evt) {
    if (execFunc) {
      execFunc();
    }
  }
  req.onerror = function(evt)
  {
    if (execFunc) {
      execFunc();
    }
  }
}

function _ixScan(db, args)
{
  var tx = args[0];
  var storeName = args[1];
  var onsuccess = args[2];
  var beforeCallbackFunc = args[3];

  tx = (tx || db.transaction(storeName, rxw));
  var store = tx.objectStore(storeName);

  var arr = [];

  var req = store.openCursor();
  req.onsuccess = function(evt) {
    var cursor = evt.target.result;
    if (!cursor) {
      if (onsuccess) {
        if (beforeCallbackFunc) {
          arr = beforeCallbackFunc(arr);
        }
        onsuccess(store, arr);
      }
      return;
    }
    arr.push(cursor.value);

    eval("cursor.continue()");  // eval() for IE8 which is sensitive to keyword 'continue'.
  };
}

function _ixStore(db, args)
{
  var storeName = args[0];
  var attrs = args[1];
  var onsuccess = args[2];

  var tx = db.transaction([storeName], rxw);

  var store = tx.objectStore(storeName);

  if (attrs[store.keyPath] == null) {
    delete(attrs[store.keyPath]);
  }

  store.put(
      attrs
    ).onsuccess = function(evt) {
    };

  if (onsuccess) {
    tx.oncomplete = function(evt) {
      onsuccess();
    };
  }
  return true;
}

function ixDeleteRecords(dbName, storeName, keyVals, onsuccess, beforeCallbackFunc)
{
  ixOpenDb(dbName, null, _ixDeleteRecords, [storeName, keyVals, onsuccess, beforeCallbackFunc]);
}

function _ixDeleteRecords(db, args)
{
  var storeName = args[0];
  var keyVals = args[1];
  var onsuccess = args[2];
  var beforeCallbackFunc = args[3];

  var onscanned = function(store, records) {
    var tx = store.transaction;
    tx.oncomplete = function(evt) {
      onsuccess(store, records);
    };
    var keyPath = store.keyPath;
    for (var i=0; i < records.length; i++) {
      var record = records[i];
      if (!keyVals || (keyVals.indexOf(String(record[keyPath])) >= 0)) {
        store.delete(record[keyPath]);
      }
    }
  };
  _ixScan(db, [null, storeName, onscanned, beforeCallbackFunc]);
}

