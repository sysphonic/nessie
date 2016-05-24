/**-----------------**-----------------**-----------------**
 Copyright (c) 2007-2016, MORITA Shintaro, Sysphonic. All rights reserved.
   http://sysphonic.com/
 This module is released under New BSD License.
 **-----------------**-----------------**-----------------**/

var PREFIX_DB = "DB_";
var PREFIX_STORE = "STORE_";
var PREFIX_IDX = "IDX_";

var nodeImgs = [
  ["foot/database.png", "foot/database.png"],
  ["foot/objectstore.png", "foot/objectstore.png"],
  ["foot/field.png", "foot/field.png"],
  ["foot/key.png", "foot/key.png"]
];
var NODE_ICON_DB = 0;
var NODE_ICON_STORE = 1;
var NODE_ICON_FIELD = 2;
var NODE_ICON_KEY = 3;

var _dbNames = [];
var _oDatabases = [];
var _curDatabase = null;
var _curStore = null;
var _curIndex = null;
var _curRecord = null;

function onLoadNessiefoot()
{
  processParams();
  onResize(true);
  loadTree();

  addEvent(window, "resize", onResize);

  activateDraggableBorders();
}

function processParams()
{
  _dbNames = [];
  var query = window.location.search.substring(1);
  var prms = query.split("&");

  for (var i=0; i < prms.length; i++) {
    var pos = prms[i].indexOf("=");
    if (pos > 0) {
      var key = prms[i].substring(0, pos);
      var val = prms[i].substring(pos + 1);
      switch (key) {
        case "db_name":
          _dbNames[i] = val;
          break;
      }
    }
  }
}

function onResize(reqInit)
{
  var regionHight = getClientRegion().height;
  var row_control_panel = _z("row_control_panel");
  if (row_control_panel) {
    regionHight -= (row_control_panel.clientHeight);
  }

  var div_db_tree = _z("div_db_tree");
  if (div_db_tree) {
    div_db_tree.style.height = (regionHight-8) + "px";
  }

  if (reqInit) {
    var div_records = _z("div_records");
    var div_record_info = _z("div_record_info");
    div_records.style.height = ((regionHight-6-8)/2) + "px";
    div_record_info.style.height = ((regionHight-6-8)/2) + "px";
  }
}

function onDbNameEntered()
{
  var input_db_name = _z("input_db_name");
  if (input_db_name && input_db_name.value) {
    _dbNames = [input_db_name.value];

    prog("CENTER");
    if (location.search) {
      location.href = location.href.replace(location.search, "?db_name="+input_db_name.value);
    } else {
      location.href += "?db_name="+input_db_name.value;
    }
  }
}

function loadTree()
{
  for (var i=0; i < _dbNames.length; i++) {
    var dbName = _dbNames[i];

    var nodes = [
      [PREFIX_DB+dbName, dbName+"<span id=\"db_version:"+dbName+"\"></span>", "", "", NODE_ICON_DB]
    ];
    ThetisBox.buildTree("", nodes, "db_tree", nodeImgs);

    ixOpenDb(dbName, null, getDbInfo, [buildDbNode]);
  }
}

function buildDbNode(oDatabase)
{
  _z("db_version:"+oDatabase.name).innerHTML = "&nbsp;(ver. " + oDatabase.version + ")";

  for (var i=0; i < oDatabase.stores.length; i++) {
    var oStore = oDatabase.stores[i];
    addStoreNode(oDatabase, oStore);

    for (var k=0; k < oStore.indices.length; k++) {
      var oIndex = oStore.indices[k];
      addIndexNode(oDatabase, oStore, oIndex);
    }
  }
}

function addStoreNode(oDatabase, oStore)
{
  var dbName = oDatabase.name;
  var storeName = oStore.name;

  var nodes = [
    [PREFIX_STORE+dbName+"_"+storeName, storeName, "", "onStoreOrIndexClicked('"+dbName+"', '"+storeName+"', null);", NODE_ICON_STORE]
  ];
  ThetisBox.buildTree(PREFIX_DB+dbName, nodes, "db_tree", nodeImgs);
}

function addIndexNode(oDatabase, oStore, oIndex)
{
  var dbName = oDatabase.name;
  var storeName = oStore.name;
  var indexName = oIndex.name;

  var imgIdx = NODE_ICON_FIELD;
  if (oIndex.unique) {
    imgIdx = NODE_ICON_KEY;
  }
  var nodes = [
    [PREFIX_IDX+dbName+"_"+storeName+"_"+indexName, indexName, "", "onStoreOrIndexClicked('"+dbName+"', '"+storeName+"', '"+indexName+"');", imgIdx]
  ];
  ThetisBox.buildTree(PREFIX_STORE+dbName+"_"+storeName, nodes, "db_tree", nodeImgs);
}

function getRecordSummary(oRecord, ikeyPath)
{
  if (!oRecord) {
    return "";
  }

  var summary = [];
  for (var i=0; i < oRecord.store.fieldNames.length; i++) {
    var attr = oRecord.store.fieldNames[i];
    var val = oRecord.attrs[attr];
    var entry = "<span class=\"record_summary_cap\">"+escapeHTML(String(attr))+":"+"</span>"+escapeHTML(truncateStr(String(val), 100));
    if (attr == ikeyPath) {
      entry = "<span class=\"record_summary_highlight\">"+entry+"</span>";
    }
    summary.push(entry);
  }
  return summary.join("<span style=\"color:gray;\">, </span>");
}

function getRecordValExp(val, valType)
{
  var dispVal = (val || "");
  switch (valType) {
    case "Array":
      dispVal = val.inspect();  // prototype.js
      break;
    case "Date":
      dispVal = getDateTimeExp(val);
      break;
  }
  return String(dispVal);
}

function displayStoreRecords(oStore, ikeyPath)
{
  ThetisBox.clear("CONFIRM");

  var keyPath = oStore.keyPath;
  var oRecords = oStore.records;

  var html = "";
  html += "<thead>";
  html += " <tr>";
  for (var i=0; i < oStore.fieldNames.length; i++) {
    var attr = escapeHTML(String(oStore.fieldNames[i]));
    html += "   <td onclick=\"sortRows(this, '"+attr+"');\" style=\"text-align:center; white-space:nowrap; cursor:pointer;\">"+attr+"</td>";
  }
  html += " </tr>";
  html += "</thead>";

  html += "<tbody>";
  if (oRecords.length == 0) {
    html += " <tr>";
    html += "   <td colspan=\"10\">";
    html += "     <div class=\"div_empty\">No Data found.</div>";
    html += "   </td>";
    html += " </tr>";
  } else {
    for (var i=0; i < oRecords.length; i++) {
      var oRecord = oRecords[i];
      var keyPathVal = oRecord.keyPathVal;
      html += " <tr class=\"record_row\" onclick=\"onStoreRecordClicked(this, '"+keyPathVal+"');\">";
      for (var k=0; k < oStore.fieldNames.length; k++) {
        var attr = oStore.fieldNames[k];
        var val = oRecord.attrs[attr];
        var dispVal = null;
        if (val == undefined) {
          dispVal = "<span style=\"color:gray;\">--</span>";
        } else {
          var valType = getTypeExp(val);
          dispVal = escapeHTML(truncateStr(getRecordValExp(val, valType), 100));
        }
        var classAttr = "";
        if (attr == ikeyPath) {
          classAttr = "class=\"record_attr_highlight\"";
        }
        html += "   <td "+classAttr+" style=\"text-align:center;\">";
        html += dispVal;
        html += "     <span class=\"sort_"+escapeHTML(String(attr))+"\" style=\"display:none;\">"+escapeHTML(String(val))+"</span>";
        html += "   </td>";
      }
      html += "   <td><input type=\"checkbox\" class=\"check_record\" id=\"check_record"+escapeHTML(String(keyPathVal))+"\" onclick=\"stopEvent(event, false);\" /></td>";
      html += " </tr>";
    }
  }
  html += "</tbody>";

  var div_records = _z("div_records");
  var orgWidth = div_records.offsetWidth;
  div_records.style.maxWidth = orgWidth + "px";

  _z("tbl_records").innerHTML = html;
}

function setRecordRowSelected(elem)
{
  var elems = document.getElementsByClassName("record_selected");
  for (var i=0; i < elems.length; i++) {
    removeClassName(elems[i], "record_selected");
  }
  appendClassName(elem, "record_selected");
}

function onStoreRecordClicked(elem, keyPathVal)
{
  _curRecord = findRecordCache(_curStore, keyPathVal);

  if (_curRecord) {
    setRecordRowSelected(elem);
    displayStoreRecord(_curRecord);
  }
}

function displayStoreRecord(oRecord)
{
  hideEditRecord();

  var html = "";
  html += "<thead>";
  html += " <tr>";
  html += "   <td style=\"width:15%;\">Field</td>";
  html += "   <td style=\"width:80%;\">Value</td>";
  html += "   <td style=\"width:5%;\">Type</td>";
  html += " </tr>";
  html += "</thead>";

  html += "<tbody>";
  if (oRecord) {
    var oStore = oRecord.store;
    for (var i=0; i < oStore.fieldNames.length; i++) {
      var attr = oStore.fieldNames[i];
      var trClassAttr = "";
      var dispVal = "";
      var valType = "";
      if (Object.keys(oRecord.attrs).indexOf(attr) >= 0) {
        var val = oRecord.attrs[attr];
        valType = getTypeExp(val);
        if (val == undefined) {
          dispVal = "<span style=\"color:gray;\">--</span>";
        } else {
          dispVal = escapeHTML(getRecordValExp(val, valType));
        }
      } else {
        trClassAttr = " class=\"disabled\"";
        dispVal = "--";
        valType = "--";
      }
      html += " <tr"+trClassAttr+">";
      html += "   <td>"+escapeHTML(String(attr))+"</td>";
      html += "   <td>"+dispVal+"</td>";
      html += "   <td>"+escapeHTML(String(valType))+"</td>";
      html += " </tr>";
    }
  } else {
    html += " <tr>";
    html += "   <td colspan=\"10\">";
    html += "     <div class=\"div_empty\">No Record selected.</div>";
    html += "   </td>";
    html += " </tr>";
  }
  html += "</tbody>";

  _z("tbl_record_info").innerHTML = html;
}

function appendDbCache(oDatabase)
{
  for (var i=0; i < _oDatabases.length; i++) {
    var oDb = _oDatabases[i];
    if (oDb.name == oDatabase.name) {
      _oDatabases[i] = oDatabase;
      return;
    }
  }
  _oDatabases.push(oDatabase);
}

function findDbCache(dbName)
{
  if (!dbName) {
    return null;
  }
  for (var i=0; i < _oDatabases.length; i++) {
    var oDatabase = _oDatabases[i];
    if (oDatabase.name == dbName) {
      return oDatabase;
    }
  }
  return null;
}

function findStoreCache(oDatabase, storeName)
{
  if (!oDatabase && !storeName) {
    return null;
  }
  for (var i=0; i < oDatabase.stores.length; i++) {
    var oStore = oDatabase.stores[i];
    if (oStore.name == storeName) {
      return oStore;
    }
  }
  return null;
}

function findRecordCache(oStore, keyPathVal)
{
  if (!oStore) {
    return null;
  }
  var oRecords = oStore.records;
  for (var i=0; i < oRecords.length; i++) {
    var oRecord = oRecords[i];
    if (String(keyPathVal) == String(oRecord.keyPathVal)) {
      return oRecord;
    }
  }
  return null;
}

function getDbInfo(db, args)
{
  var nextFunc = args[0];

  if (db.version == "") {
    db.close();
  } else {
    var oDatabase = new ixDatabase(db);
    appendDbCache(oDatabase);

    try {
      var tx = db.transaction(db.objectStoreNames);

      if (nextFunc) {
        tx.oncomplete = function() { nextFunc(oDatabase) };
        //tx.onabort = function() { nextFunc(oDatabase) };  // for Chrome
      }

      for (var i=0; i < db.objectStoreNames.length; i++) {
        var storeName = db.objectStoreNames.item(i);
        var store = tx.objectStore(storeName);
        oDatabase.stores.push(new ixStore(oDatabase, store));
      }
    } catch (e) {
      msg(e.toString());
    }
    db.close();
  }
}

function getStoreOrIndexInfo(dbName, storeName, indexName)
{
  var req = window.indexedDB.open(dbName);
  req.onerror = function(event) { };
  req.onsuccess = function(event) {
    var db = event.target.result;

    try {
      var tx = db.transaction([storeName]);

      var store = tx.objectStore(storeName);
      _curDatabase = findDbCache(dbName);
      _curStore = findStoreCache(_curDatabase, storeName);
      if (_curStore) {
        _curStore.clearRecords();
      } else {
        _curStore = new ixStore(_curDatabase, store);
      }
      _curIndex = null;

      var reqCursor = store.openCursor();
      if (indexName) {
        var index = store.index(indexName);
        _curIndex = new ixIndex(index);

        reqCursor = index.openCursor();
      }
      reqCursor.onerror = function(event) { };
      reqCursor.onsuccess = function(event) {
        var cursor = event.target.result;
        if (cursor) {
          _curStore.addRecord(cursor.value);
          cursor.continue();
        }
      };
      tx.oncomplete = function(event) {
        if (indexName) {
          displayStoreRecords(_curStore, _curIndex.keyPath);
        } else {
          displayStoreRecords(_curStore);
        }
      };
    } catch(ex) {
      if (ex.code == IDBTransaction.NOT_FOUND_ERR) {
        console.log("ObjectStore no longer exists. Database needs to be refreshed.");
      } else {
        throw(ex);
      }
    }
    db.close();
  };
}

function onStoreOrIndexClicked(dbName, storeName, indexName)
{
  if (!dbName) {
    dbName = _curDatabase.name;
    storeName = _curStore.name;
    if (_curIndex) {
      indexName = _curIndex.name;
    }
  }

  displayStoreRecord(null);
  getStoreOrIndexInfo(dbName, storeName, indexName);
}

var thetisBoxEditRecord = null;

function hideEditRecord()
{
  if (thetisBoxEditRecord) {
    thetisBoxEditRecord.remove();
    thetisBoxEditRecord = null;
  }
}

function getEditRecordHtml(oDatabase, oStore, oRecord)
{
  var html = "";

  html += "<table style=\"width:95%; height:100%; margin:0px auto;\">";
  html += "  <tr style=\"height:80%;\">";
  html += "    <td style=\"height:80%; text-align:center;\">";

  html += "<table style=\"width:100%; height:100%; border-spacing:0px;\">";
  html += "  <tr>";
  html += "    <td style=\"width:80px;\"></td>";
  html += "    <td></td>";
  html += "    <td style=\"width:40px; text-align:center;\">";
  html += "      <span style=\"font-style:italic;\">Type</span>";
  html += "    </td>";
  html += "  </tr>";
  for (var i=0; oStore && (i < oStore.fieldNames.length); i++) {
    var fieldName = oStore.fieldNames[i];
    html += "  <tr>";
    html += "    <td style=\"text-align:left; padding-left:5px;\">";
    html += fieldName;
    html += "    </td>";
    html += "    <td style=\"text-align:center;\">";
    var val = null;
    var dispVal = "";
    var valType = null;
    if (oRecord) {
      val = oRecord.attrs[fieldName];
      valType = getTypeExp(val);
      dispVal = getRecordValExp(val, valType);
    }
    html += "      <textarea class=\"edit_record_val\" id=\"edit_record:"+escapeHTML(fieldName)+"\" style=\"width:90%; height:50px:\">"+escapeHTML(String(dispVal))+"</textarea>";
    html += "    </td>";
    html += "    <td style=\"text-align:center; padding:0px 5px;\">";
    html += "      <select class=\"val_type\" id=\"val_type:"+escapeHTML(fieldName)+"\" style=\"width:85px;\" onchange=\"onRecordValTypeChanged('"+escapeHTML(fieldName)+"')\">";
    var selected = "";
    selected = (valType == "string")?"selected":"";
    html += "        <option value=\"string\" "+selected+"></option>";
    selected = (valType == "number")?"selected":"";
    html += "        <option value=\"number\" "+selected+">Number</option>";
    selected = (valType == "Array")?"selected":"";
    html += "        <option value=\"array\" "+selected+">Array</option>";
    selected = (valType == "Date")?"selected":"";
    html += "        <option value=\"date\" "+selected+">Date</option>";
    selected = (valType == "null")?"selected":"";
    html += "        <option value=\"null\" "+selected+">null</option>";
    selected = (valType == "undefined")?"selected":"";
    html += "        <option value=\"undefined\" "+selected+">undefined</option>";
    html += "      </select>";
    html += "    </td>";
    html += "  </tr>";
    html += "  <tr style=\"height:1px;\"><td></td></tr>";
  }
  html += "</table>";

  html += "    </td>";
  html += "  </tr>";
  html += "  <tr style=\"height:15%;\">";
  html += "    <td style=\"text-align:center;\">";

  html += "      <table style=\"margin:0px auto;\">";
  html += "        <tr>";
  html += "          <td style=\"text-align:center;\">";
  var dbName= escapeHTML(oDatabase.name);
  var storeName= escapeHTML(oStore.name);
  if (oRecord) {
    var keyPathVal= escapeHTML(String(oRecord.keyPathVal));
    html += "          <input type=\"button\" value=\""+t("btn.ok")+"\" onclick=\"onEditRecordOkClicked('"+dbName+"', '"+storeName+"', '"+keyPathVal+"');\" style=\"width:80px; height:25px\">";
  } else {
    html += "          <input type=\"button\" value=\""+t("btn.ok")+"\" onclick=\"onEditRecordOkClicked('"+dbName+"', '"+storeName+"');\" style=\"width:80px; height:25px\">";
  }
  html += "          </td>";
  html += "        </tr>";
  html += "      </table>";

  html += "    </td>";
  html += "  </tr>";
  html += "</table>";

  return html;
}

function onRecordValTypeChanged(fieldName)
{
  var val_type = _z("val_type:"+fieldName);
  var edit_record = _z("edit_record:"+fieldName);
  if (!val_type || !edit_record) {
    return;
  }
  switch (val_type.value) {
    case "null":
    case "undefined":
      edit_record.disabled = true;
      break;
    default:
      edit_record.disabled = false;
      break;
  }
}

function showEditRecord(oDatabase, oStore, oRecord)
{
  hideEditRecord();

  thetisBoxEditRecord = new ThetisBox;
  if (oRecord) {
    thetisBoxEditRecord.title = "Edit in "+oStore.name;
  } else {
    thetisBoxEditRecord.title = "Create in "+oStore.name;
  }
  thetisBoxEditRecord.overflow = "auto";
  thetisBoxEditRecord.resizable = true;
  thetisBoxEditRecord.show(
            "CENTER",
            "380,400",
            "TRAY",
            "",
            "",
            getEditRecordHtml(oDatabase, oStore, oRecord)
          );

  for (var i=0; i < oStore.fieldNames.length; i++) {
    var fieldName = oStore.fieldNames[i];
    onRecordValTypeChanged(fieldName);
  }
}

function onCreateRecordClicked()
{
  if (!_curDatabase || !_curStore) {
    tip("Please select an ObjectStore.", "CENTER");
    return false;
  }

  showEditRecord(_curDatabase, _curStore, null);
}

function onEditRecordClicked()
{
  if (!_curDatabase || !_curStore || !_curRecord) {
    tip("Please select a record.", "CENTER");
    return false;
  }

  showEditRecord(_curDatabase, _curStore, _curRecord);
}

function onEditRecordOkClicked(dbName, storeName, keyPathVal)
{
  var oDatabase = findDbCache(dbName);
  var oStore = findStoreCache(oDatabase, storeName);
  if (!oDatabase || !oStore) {
    return false;
  }
  var oRecord = null;
  if (keyPathVal != undefined) {
    oRecord = findRecordCache(oStore, keyPathVal);
    if (!oRecord) {
      msg("[ERROR] Cannot find Record-"+keyPathVal);
      return false;
    }
  }

  var attrs = {};
  var elems = document.getElementsByClassName("edit_record_val");
  for (var i=0; i < elems.length; i++) {
    var elem = elems[i];
    var fieldName = elem.id.replace(/^edit_record:/, "");
    var val = elem.value;
    var valType = _z("val_type:"+fieldName).value;
    try {
      switch (valType) {
        case "":
        case "string":
          break;
        case "number":
          val = Number(val);
          break;
        case "array":
          val = eval(val);
          break;
        case "date":
          val = getDateFromString(val);
          break;
        case "null":
          val = null;
          break;
        case "undefined":
          val = undefined;
          break;
      }
    } catch (e) {
      msg("[ERROR] " + fieldName + ": " + e.toString());
      return false;
    }
    attrs[fieldName] = val;
  }
  if (oRecord) {
    oRecord.updateAttrs(attrs);
  } else {
    oRecord = new ixRecord(attrs, oDatabase, oStore);
    oStore.addRecord(attrs);
  }

  var onsuccess = function() {
    tip("Successfully updated.", "TOP-RIGHT");
    onStoreOrIndexClicked();
  };
  ixOpenDb(_curDatabase.name, null, _ixSave, [oStore.name, attrs, onsuccess]);

  hideEditRecord();
}

function onSelectAllRecordsClicked()
{
  selectAll("check_record");
}

function onDeleteRecordsClicked()
{
  var keyVals = getCheckedRecords();
  if (keyVals.length <= 0) {
    return;
  }
  confm(String(keyVals.length)+" records will be deleted. Are you sure?", "doDeleteRecords()");
}

function doDeleteRecords()
{
  var keyVals = getCheckedRecords();
  if (keyVals.length <= 0) {
    return;
  }
  var dbName = _curDatabase.name;
  var storeName = _curStore.name;
  var onsuccess = function(store, arr) {
    tip("Successfully deleted.", "TOP-RIGHT");
    onStoreOrIndexClicked();
  };
  ixDeleteRecords(dbName, storeName, keyVals, onsuccess, null);
}

function getCheckedRecords()
{
  var arr = [];
  var elems = document.getElementsByClassName("check_record");
  for (var i=0; i < elems.length; i++) {
    var elem = elems[i];
    if (elem.checked) {
      arr.push(elem.id.replace(/^check_record/, ""));
    }
  }
  return arr;
}

function activateDraggableBorders()
{
  new Draggable("drag_v_border", {revert:false, constraint:"horizontal"});
  new Draggable("drag_h_border", {revert:false, constraint:"vertical"});

  var BorderDragObserver = Class.create();
  BorderDragObserver.prototype = {
    initialize: function() {
    },
    onStart: function(eventName, draggable, event) {
    },
    onDrag: function(eventName, draggable, event) {
      if (draggable.element.id == "drag_v_border") {
        var div_db_tree = _z("div_db_tree");
        var td_tree = _z("td_tree");
        var td_view = _z("td_view");
        var div_records = _z("div_records");
        var div_record_info = _z("div_record_info");

        var orgWidthRecordTree = div_db_tree.offsetWidth;
        var orgWidthRecords = div_records.offsetWidth;

        draggable.options.snap = function(x, y) {
          return onVerticalBorderDragged(x, y, div_db_tree, td_tree, td_view, div_records, div_record_info, orgWidthRecordTree, orgWidthRecords)
        };
      } else if (draggable.element.id == "drag_h_border") {
        var div_records = _z("div_records");
        var div_record_info = _z("div_record_info");

        var orgHeightRecords = div_records.offsetHeight;
        var orgHeightRecordInfo = div_record_info.offsetHeight;

        draggable.options.snap = function(x, y) {
          return onHorizontalBorderDragged(x, y, div_records, div_record_info, orgHeightRecords, orgHeightRecordInfo);
        };
      }
    },
    onEnd: function(eventName, draggable, event) {
      if (draggable.element.id != "drag_v_border"
          && draggable.element.id != "drag_h_border") {
        return;
      }
    }
  }
  Draggables.addObserver( new BorderDragObserver() );
}

function onVerticalBorderDragged(x, y, div_db_tree, td_tree, td_view, div_records, div_record_info, orgWidthRecordTree, orgWidthRecords)
{
  var leftWidth = orgWidthRecordTree + x;
  var rightWidth = orgWidthRecords - x;
//  if (leftWidth < 100 && x < 0) {
//    return [100-orgWidthRecordTree, y];
//  } else if (rightWidth < 100 && x > 0) {
//    return [orgWidthRecords-100, y];
//  }
  div_db_tree.style.width = leftWidth + "px";
  td_tree.style.width = leftWidth + "px";

  div_records.style.width = rightWidth + "px";
  div_record_info.style.width = div_records.style.width;
  td_view.style.width = rightWidth + "px";

  return [x, y];
}

function onHorizontalBorderDragged(x, y, div_records, div_record_info, orgHeightRecords, orgHeightRecordInfo)
{
  var upperHeight = orgHeightRecords + y;
  var lowerHeight = orgHeightRecordInfo - y;
//  if (upperHeight < 10 && y < 0) {
//    return [x, 10-orgHeightRecords];
//  } else if (lowerHeight < 10 && y > 0) {
//    return [x, orgHeightRecordInfo-10];
//  }
  div_records.style.height = upperHeight + "px";
  div_record_info.style.height = lowerHeight + "px";

  return [x, y];
}

function selectSortListFuncBasic(col, type)
{
  var func = function(row_a, row_b) {
    var a = trim(getElemByClassNameInChildNodes(row_a, "sort_"+col, true).innerHTML);
    var b = trim(getElemByClassNameInChildNodes(row_b, "sort_"+col, true).innerHTML);
    var regexpIsFloat = /^[+\-]?([0-9]+[.])?[0-9]+$/;
    if (a.match(regexpIsFloat) && b.match(regexpIsFloat)) {
      a = parseFloat(a);
      b = parseFloat(b);
    }
    if (a < b) return ((type == "ASC") ? (-1) : (1));
    if (a > b) return ((type == "ASC") ? (1) : (-1));
    return 0;
  };
  return func;
}

function dispSortSign(elem, type)
{
  var sort_sign = _z("sort_sign");
  if (sort_sign) {
    removeElem(sort_sign);
  }
  sort_sign = document.createElement("span");
  sort_sign.innerHTML = (type == "ASC") ? "&and;" : "&or;";
  sort_sign.id = "sort_sign";
  elem.appendChild(sort_sign);
}

function sortRows(elem, col)
{
  var sort_type = _z("sort_type");
  var sort_col = _z("sort_col");
  var type = sort_type.value;

  if (col == sort_col.value) {
    type = (type == "ASC") ? "DESC" : "ASC";
  }
  sort_col.value = col;
  sort_type.value = type;

  dispSortSign(elem, type);

  var rows = collectionToArray(document.getElementsByClassName("record_row"));

  var progress = null;
  if (rows.length > 80) {
    progress = tip("Please wait ..", "CENTER");
  }

  setTimeout(function() {_sortRows(elem, col, type, rows, progress)}, 0);
}

function _sortRows(elem, col, type, rows, progress)
{
  if (rows.length > 0) {
    var func = null;
    if (typeof(selectSortListFunc) == "function") {
      func = selectSortListFunc(col, type);
    } else {
      func = selectSortListFuncBasic(col, type);
    }
    rows.sort(
        function(row_a, row_b) {
          return func(row_a, row_b);
        }
      );
    var list = rows[0].parentNode;
    for (var i=0; i < rows.length; i++) {
      removeElem(rows[i]);
    }
    for (var i=0; i < rows.length; i++) {
      list.appendChild(rows[i]);
    }
  }

  if (progress) {
    progress.hide();
  }

  if (typeof(finishSortList) == "function") {
    setTimeout(function() {finishSortList(rows, elem, col)}, 0);
  }
}

