/**-----------------**-----------------**-----------------**
   Copyright (c) 2007-2016, MORITA Shintaro, Sysphonic. All rights reserved.
   http://sysphonic.com/
 This module is released under New BSD License.
 **-----------------**-----------------**-----------------**/

/**----------------**----------------**----------------**----------------**/
// DRAG BY PROTOTYPE.JS >>>
var ThetisPaletteDragObserver = Class.create();
ThetisPaletteDragObserver.prototype = {
  initialize: function() {
  },
  onStart: function(eventName, draggable, event) {
    var elem = draggable.element;

    var instance = ThetisPalette.instances_h[elem.id];
    if (instance) {
      instance.clear_blur_timer(false);
    }
  },
  onDrag: function(eventName, draggable, event) {
    var elem = draggable.element;
  },
  onEnd: function(eventName, draggable, event) {
    var elem = draggable.element;

    ThetisPalette.restoreFocus(elem.id);
  }
}
Draggables.addObserver(new ThetisPaletteDragObserver());
// DRAG BY PROTOTYPE.JS <<<
/**----------------**----------------**----------------**----------------**/


ThetisPalette = function(paintarea_id, input_id, disp_id)
{
  this.func = null;
  this.disp_id = disp_id;
  this.paintarea_id = paintarea_id;
  this.input_id = input_id;

  this.__paintarea = null;
  this.__disp_elem = null;
  this.__input_elem = null;
  this.style = new ThetisPalette.Style();

  ThetisPalette.instances_h[this.disp_id] = this;

  var paintarea = this.getPaintArea();
  if (paintarea) {
    this.addEvent(paintarea, "keydown",
                    function(evt) {
                      evt = evt || window.event;
                      if (evt.keyCode == 13) {
                        var elem = evt.target || evt.srcElement;
                        if (elem.onclick) {
                          elem.onclick();
                        }
                        evt.cancelBubble = true;
                        evt.returnValue = false;
                      }
                      return false;
                    }
                    );
  }
  return this;
};

ThetisPalette.VERSION = "0.9.0";

ThetisPalette.prototype.setFunc = function(f) {
  this.func = f;
}

ThetisPalette.captions = ["Close", "Clear"];
ThetisPalette.setCaptions = function(array) {
  ThetisPalette.captions = array;
}

ThetisPalette.buttons = {};
ThetisPalette.setButtons = function(hash)
{
  ThetisPalette.buttons = hash;
}

ThetisPalette.prototype.draggable = null;
ThetisPalette.prototype.zindex = 30000;
ThetisPalette.prototype.show_clear = false;

ThetisPalette.instances_h = [];
ThetisPalette.restoreFocus = function(disp_id)
{
  var instance = ThetisPalette.instances_h[disp_id];
  if (instance && instance.is_set_blur) {
    var paintarea = instance.getPaintArea();
    if (paintarea) {
      try {
        paintarea.focus();
      } catch (e) {
      }
    }
  }
}
ThetisPalette.clear_blur_timer = function(disp_id)
{
  if (ThetisPalette.instances_h[disp_id]) {
    ThetisPalette.instances_h[disp_id].clear_blur_timer(true);
  }
}
ThetisPalette.prototype.is_set_blur = false;
ThetisPalette.prototype.blur_timer_id = null;
ThetisPalette.prototype.set_blur_timer = function()
{
  if (this.blur_timer_id == "xxxx") { // Prohibitted
    this.blur_timer_id = null;
  } else {
    this.blur_timer_id = setTimeout("ThetisPalette.on_blur_timer(\""+this.disp_id+"\");", 200);
  }
}

ThetisPalette.on_blur_timer = function(disp_id)
{
  var instance = ThetisPalette.instances_h[disp_id];

  if (instance && !instance.blur_timer_id) {
    return;
  }

  if (instance) {
    instance.hide();
  }
/*
  var elem = document.getElementById(disp_id+"_clone");
  if (elem) {
    elem.style.display = "none";
  }
*/
}

ThetisPalette.prototype.clear_blur_timer = function(delay_ctl)
{
/* // DEBUG >>>
  var last = this.blur_timer_id;
// DEBUG <<< */
  if (this.blur_timer_id) {
    clearTimeout(this.blur_timer_id);
  }
  this.blur_timer_id = null;

  if (delay_ctl) {
    this.blur_timer_id = "xxxx"; // Prohibit
  }
/* // DEBUG >>>
  var cur = this.blur_timer_id;

  var debug = _z("debug_clear_blur_timer");
  if (!debug) {
    var paintarea = this.getPaintArea();
    if (paintarea) {
      debug = document.createElement("span");
      debug.id = "debug_clear_blur_timer";
      paintarea.parentNode.appendChild(debug);
    }
  }
  if (debug) {
    debug.innerHTML = "LAST:" + last + " CURRENT:" + cur;
  }
// DEBUG <<< */
}

ThetisPalette.Style = function()
{
  return this;
};

ThetisPalette.Style.prototype.frame_width       = "225px";
ThetisPalette.Style.prototype.frame_color       = "#9b9bef";
ThetisPalette.Style.prototype.bgcolor           = "#F0F0F0";
ThetisPalette.Style.prototype.cap_color         = "#FFFFFF";
ThetisPalette.Style.prototype.cap_hover_color   = "#009900";
ThetisPalette.Style.prototype.cap_hover_bgcolor = "#FFFFCC";
ThetisPalette.Style.prototype.cursor            = "pointer";
ThetisPalette.Style.prototype.border_color      = "#E0E0E0";

ThetisPalette.Style.prototype.set = function(key,val) { this[key] = val; }
ThetisPalette.Style.prototype.get = function(key) { return this[key]; }
ThetisPalette.prototype.setStyle = function(key,val) { this.style.set(key,val); };
ThetisPalette.prototype.getStyle = function(key) { return this.style.get(key); };

ThetisPalette.prototype.getDispElem = function()
{
  if (this.__disp_elem) {
    return this.__disp_elem;
  }
  this.__disp_elem = document.createElement("div");
  this.__disp_elem.id = this.disp_id + "_clone";
  this.__disp_elem.style.zIndex = this.zindex;
  document.body.appendChild(this.__disp_elem);

  return this.__disp_elem;
};

ThetisPalette.prototype.getPaintArea = function()
{
  if (this.__paintarea) {
    return this.__paintarea;
  }
  this.__paintarea = document.getElementById(this.paintarea_id);

  return this.__paintarea;
};

ThetisPalette.prototype.getInputElem = function()
{
  if (this.__input_elem) {
    return this.__input_elem;
  }
  this.__input_elem = document.getElementById(this.input_id);

  return this.__input_elem;
};

ThetisPalette.prototype.getFormValue = function()
{
  var input = this.getInputElem();
  if (input) {
    return input.value;
  } else {
    return "";
  }
};

ThetisPalette.prototype.setFormValue = function(val)
{
  var input = this.getInputElem();
  if (input) {
    input.value = val;
  }
  var paintarea = this.getPaintArea();
  if (paintarea) {
    paintarea.style.backgroundColor = val;
  }
};

ThetisPalette.prototype._show = function()
{
  this.getDispElem().style.display = "";

  if (this.is_set_blur) {
    var paintarea = this.getPaintArea();
    if (paintarea) {
      paintarea.focus();
    }
  }
};

ThetisPalette.prototype.hide = function()
{
  if (this.draggable) {
    this.draggable.destroy();
    this.draggable = null;
  }

  var dispElem = this.getDispElem();
  if (dispElem) {
    dispElem.parentNode.removeChild(dispElem);
  }
  this.__disp_elem = null;
};

ThetisPalette.prototype.addEvent = function(elem, evt, func)
{
  // Use prototype.js if available
  if (window.Event && Event.observe) {
    Event.observe(elem, evt, func, false);
  } else {
    elem["on"+evt] = func;
  }
}

ThetisPalette.COLORS = [
  "seashell",  // #FFF5EE
  "mistyrose",  // #FFE4E1
  "lightsalmon",  // #FFA07A
  "coral",  // #FF7F50
  "red",  // #FF0000
  "orangered",  // #FF4500
  "tomato",  // #FF6347
  "salmon",  // #FA8072
  "darksalmon",  // #E9967A
  "lightcoral",  // #F08080
  "indianred",  // #CD5C5C
  "firebrick",  // #B22222
  "brown",  // #A52A2A
  "darkred",  // #8B0000

  "linen",  // #FAF0E6
  "bisque",  // #FFE4C4
  "peachpuff",  // #FFDAB9
  "orange",  // #FFA500
  "darkorange",  // #FF8C00
  "sandybrown",  // #F4A460
  "peru",  // #CD853F
  "chocolate",  // #D2691E
  "burlywood",  // #DEB887
  "tan",  // #D2B48C
  "rosybrown",  // #BC8F8F
  "sienna",  // #A0522D
  "saddlebrown",  // #8B4513
  "maroon",  // #800000

  "floralwhite",  // #FFFAF0
  "oldlace",  // #FDF5E6
  "antiquewhite",  // #FAEBD7
  "papayawhip",  // #FFEFD5
  "blanchedalmond",  // #FFEBCD
  "moccasin",  // #FFE4B5
  "navajowhite",  // #FFDEAD
  "gold",  // #FFD700
  "wheat",  // #F5DEB3
  "palegoldenrod",  // #EEE8AA
  "khaki",  // #F0E68C
  "darkkhaki",  // #BDB76B
  "goldenrod",  // #DAA520
  "darkgoldenrod",  // #B8860B

  "ivory",  // #FFFFF0
  "lemonchiffon",  // #FFFACD
  "cornsilk",  // #FFF8DC
  "beige",  // #F5F5DC
  "lightgoldenrodyellow",  // #FAFAD2
  "lightyellow",  // #FFFFE0
  "yellow",  // #FFFF00
  "greenyellow",  // #ADFF2F
  "palegreen",  // #98FB98
  "chartreuse",  // #7FFF00
  "lawngreen",  // #7CFC00
  "lime",  // #00FF00
  "springgreen",  // #00FF7F
  "mediumspringgreen",  // #00FA9A

  "mintcream",  // #F5FFFA
  "honeydew",  // #F0FFF0
  "lightgreen",  // #90EE90
  "yellowgreen",  // #9ACD32
  "darkseagreen",  // #8FBC8F
  "limegreen",  // #32CD32
  "mediumseagreen",  // #3CB371
  "olive",  // #808000
  "olivedrab",  // #6B8E23
  "forestgreen",  // #228B22
  "seagreen",  // #2E8B57
  "green",  // #008000
  "darkolivegreen",  // #556B2F
  "darkgreen",  // #006400

  "azure",  // #F0FFFF
  "lightcyan",  // #E0FFFF
  "aquamarine",  // #7FFFD4
  "aqua",  // #00FFFF
  "cyan",  // #00FFFF
  "turquoise",  // #40E0D0
  "darkturquoise",  // #00CED1
  "mediumaquamarine",  // #66CDAA
  "mediumturquoise",  // #48D1CC
  "lightseagreen",  // #20B2AA
  "cadetblue",  // #5F9EA0
  "darkcyan",  // #008B8B
  "teal",  // #008080
  "darkslategray",  // #2F4F4F

  "aliceblue",  // #F0F8FF
  "paleturquoise",  // #AFEEEE
  "powderblue",  // #B0E0E6
  "lightblue",  // #ADD8E6
  "skyblue",  // #87CEEB
  "lightskyblue",  // #87CEFA
  "deepskyblue",  // #00BFFF
  "dodgerblue",  // #1E90FF
  "royalblue",  // #4169E1
  "blue",  // #0000FF
  "mediumblue",  // #0000CD
  "darkblue",  // #00008B
  "navy",  // #000080
  "midnightblue",  // #191970

  "ghostwhite",  // #F8F8FF
  "lavender",  // #E6E6FA
  "lightsteelblue",  // #B0C4DE
  "cornflowerblue",  // #6495ED
  "steelblue",  // #4682B4
  "lightslategray",  // #778899
  "slategray",  // #708090
  "mediumslateblue",  // #7B68EE
  "slateblue",  // #6A5ACD
  "darkslateblue",  // #483D8B
  "mediumpurple",  // #9370DB
  "darkviolet",  // #9400D3
  "blueviolet",  // #8A2BE2
  "indigo",  // #4B0082

  "lavenderblush",  // #FFF0F5
  "thistle",  // #D8BFD8
  "plum",  // #DDA0DD
  "orchid",  // #DA70D6
  "violet",  // #EE82EE
  "magenta",  // #FF00FF
  "fuchsia",  // #FF00FF
  "mediumvioletred",  // #C71585
  "crimson",  // #DC143C
  "palevioletred",  // #DB7093
  "mediumorchid",  // #BA55D3
  "darkorchid",  // #9932CC
  "darkmagenta",  // #8B008B
  "purple",  // #800080

  "pink",  // #FFC0CB
  "lightpink",  // #FFB6C1
  "hotpink",  // #FF69B4
  "deeppink",  // #FF1493
  "white",  // #FFFFFF
  "snow",  // #FFFAFA
  "whitesmoke",  // #F5F5F5
  "gainsboro",  // #DCDCDC
  "lightgrey",  // #D3D3D3
  "silver",  // #C0C0C0
  "darkgray",  // #A9A9A9
  "gray",  // #808080
  "dimgray",  // #696969
  "black"  // #000000
];

ThetisPalette.REVERSAL_COLORS = [
  "red",
  "orangered",
  "tomato",
  "salmon",
  "darksalmon",
  "lightcoral",
  "indianred",
  "firebrick",
  "brown",
  "darkred",

  "darkorange",
  "sandybrown",
  "peru",
  "chocolate",
  "burlywood",
  "tan",
  "rosybrown",
  "sienna",
  "saddlebrown",
  "maroon",

  "darkkhaki",
  "goldenrod",
  "darkgoldenrod",

  "mediumseagreen",
  "olive",
  "olivedrab",
  "forestgreen",
  "seagreen",
  "green",
  "darkolivegreen",
  "darkgreen",

  "darkturquoise",
  "mediumaquamarine",
  "mediumturquoise",
  "lightseagreen",
  "cadetblue",
  "darkcyan",
  "teal",
  "darkslategray",

  "deepskyblue",
  "dodgerblue",
  "royalblue",
  "blue",
  "mediumblue",
  "darkblue",
  "navy",
  "midnightblue",

  "cornflowerblue",
  "steelblue",
  "lightslategray",
  "slategray",
  "mediumslateblue",
  "slateblue",
  "darkslateblue",
  "mediumpurple",
  "darkviolet",
  "blueviolet",
  "indigo",

  "orchid",
  "violet",
  "magenta",
  "fuchsia",
  "mediumvioletred",
  "crimson",
  "palevioletred",
  "mediumorchid",
  "darkorchid",
  "darkmagenta",
  "purple",

  "hotpink",
  "deeppink",

  "darkgray",
  "gray",
  "dimgray",
  "black"
];

ThetisPalette.prototype.show = function (x, y)
{
  var cap_table_style = "width:100%; padding:3px; border:solid 2px; border-top-color:whitesmoke; border-left-color:whitesmoke; border-bottom-color:dimgray; border-right-color:dimgray; -webkit-box-shadow:2px 2px 5px rgba(100, 100, 100, 0.2); -moz-box-shadow:2px 2px 5px rgba(100, 100, 100, 0.2); box-shadow:2px 2px 5px rgba(100, 100, 100, 0.2); -moz-border-radius:7px; -webkit-border-radius:7px; border-radius:7px;";
  cap_table_style += "background:"+this.style.frame_color+"; ";

  var cap_td_style = "";
  cap_td_style += "background:"+this.style.frame_color+"; ";
  cap_td_style += "color: "+this.style.cap_color+"; ";
  cap_td_style += "padding:0px 0px; ";
  cap_td_style += "text-align:center; ";

  var COLS = 14;
  var content = "";
  content += "<table style=\"border-spacing:0px; "+cap_table_style+"\">";
  content += "  <tr style=\"height:10px;\">";
  content += "    <td id=\""+this.disp_id+"_handle\" colspan=\""+COLS+"\" style=\"padding:0px; background-color:"+this.style.bgcolor+"; cursor:move;\" onmousedown=\"ThetisPalette.clear_blur_timer('"+this.disp_id+"');\" onmouseup=\"ThetisPalette.restoreFocus('"+this.disp_id+"');\">";
  content += "      <table style=\"width:100%; border-spacing:0px;\">";
  content += "        <tr>";
  content += "          <td style=\"background-color:"+this.style.frame_color+";\">&nbsp;</td>";
  if (this.show_clear) {
    content += "        <td id=\"__"+this.disp_id+"_btn_clear\" title=\""+ThetisPalette.captions[1]+"\" style=\"width:30px; "+cap_td_style+";\"><img src=\""+ThetisPalette.buttons["clear"]+"\" /></td>";
  }
  content += "          <td id=\"__"+this.disp_id+"_btn_close\" title=\""+ThetisPalette.captions[0]+"\" style=\"width:25px; font-size:10.5pt; font-weight:bold; "+cap_td_style+"\">&times;</td>";
  content += "        </tr>";
  content += "      </table>";
  content += "    </td>";
  content += "  </tr>";

  var curVal = null;
  var curValFound = false;
  var input = this.getInputElem();
  if (input) {
    curVal = input.value;
  }

  for (var i=0; i < ThetisPalette.COLORS.length; i++) {
    var cellVal = ThetisPalette.COLORS[i];

    if ((i % COLS) == 0) {
      content += "<tr>";
    }

    var cellStyle = "";
    cellStyle += "width:15px;";
    cellStyle += "height:15px;";
    cellStyle += "background-color:"+cellVal+";";

    if (cellVal == curVal) {
      cellStyle += "border:solid 3px "+this.style.border_color+";";
      curValFound = true;
    } else {
      cellStyle += "border:solid 1px "+this.style.border_color+";";
    }

    var title = cellVal;
    content += "<td style=\""+cellStyle+"\" title=\""+title+"\" id=\"__"+this.disp_id+"_cell"+i+"\"></td>";

    if ((i % COLS) == (COLS-1)) {
      content += "</tr>";
    }
  }
  if (!content.endsWith("</tr>")) {
    content += "</tr>";
  }
  content += "  <tr style=\"height:20px;\">";
  content += "    <td colspan=\""+COLS+"\" style=\"padding:0px; background-color:"+this.style.bgcolor+";\">";
  content += "      <table style=\"width:100%; border-spacing:0px;\">";
  content += "        <tr>";
  content += "          <td style=\"text-align:left;\" nowrap>";
  content += "            <input type=\"text\" id=\""+this.disp_id+"_color_code\" value=\""+((curValFound)?"":(curVal))+"\" style=\"width:120px;\"/>";
  content += "            <input type=\"button\" id=\""+this.disp_id+"_btn_color_code\" value=\""+t("btn.apply")+"\" style=\"width:60px;\" />";
  content += "          </td>";
  content += "        </tr>";
  content += "      </table>";
  content += "    </td>";
  content += "  </tr>";
  content += "</table>";

  var dispElem = this.getDispElem();
  if (!dispElem) return;
  dispElem.style.width = this.style.frame_width;
  dispElem.style.position = "absolute";
  dispElem.innerHTML = content;

  /*
   * Events
   */
  var __this = this;
  var getEventSrc = function(evt)
    {
      evt  = evt || window.event;
      var src = evt.target || evt.srcElement;
      return src;
    };
  var cap_onmouseover = function(evt)
    {
      var src = getEventSrc(evt);
      src.style.color = __this.style.cap_hover_color;
      src.style.background = __this.style.cap_hover_bgcolor;
    };
  var cap_onmouseout = function(evt)
    {
      var src = getEventSrc(evt);
      src.style.color = __this.style.cap_color;
      src.style.background = __this.style.frame_color;
    };
  var cell_onmouseover = function(evt)
    {
      var src = getEventSrc(evt);
    };
  var cell_onmouseout = function(evt)
    {
      var src = getEventSrc(evt);
    };
  var cell_onclick = function(evt)
    {
      var src = getEventSrc(evt);
      var m = src.id.match(/cell(\d+)/);
      __this.setFormValue(ThetisPalette.COLORS[parseInt(m[1], 10)]);
      __this.hide();
      if (__this.func) {
        __this.func();
      }
    };

  var btn_clear = document.getElementById("__"+this.disp_id+"_btn_clear");
  if (btn_clear) {
    btn_clear.style.cursor = this.style.cursor;
    this.addEvent(btn_clear, "mouseover", cap_onmouseover);
    this.addEvent(btn_clear, "mouseout", cap_onmouseout);
    this.addEvent(btn_clear, "mousedown", function(){ __this.clear_blur_timer(true); });
    this.addEvent(btn_clear, "click", function()
                {
                  __this.setFormValue("");
                  if (__this.func) {
                    __this.func();
                  }
                  __this.hide();
                }
              );
  }

  var btn_close = document.getElementById( "__"+this.disp_id+"_btn_close");
  btn_close.style.cursor = this.style.cursor;
  this.addEvent(btn_close, "mouseover", cap_onmouseover);
  this.addEvent(btn_close, "mouseout", cap_onmouseout);
  this.addEvent(btn_close, "click", function(){ __this.getFormValue(); __this.hide(); });

  for (var i=0; i < ThetisPalette.COLORS.length; i++) {
    var cellVal = ThetisPalette.COLORS[i];

    if (cellVal == curVal) continue;

    var cell = document.getElementById( "__"+this.disp_id+"_cell"+i);
    if (!cell) continue;

    cell.style.cursor = this.style.cursor;
    this.addEvent(cell, "mouseover", cell_onmouseover);
    this.addEvent(cell, "mouseout", cell_onmouseout);
    this.addEvent(cell, "mousedown", function(){ __this.clear_blur_timer(true); });
    this.addEvent(cell, "click", cell_onclick);
  }

  var paintarea = this.getPaintArea();
  if (!this.is_set_blur
      && paintarea.type != "hidden"
      && paintarea.style.display != "none") {
    this.addEvent(paintarea, "blur", function(){ __this.set_blur_timer(); });
    this.is_set_blur = true;
  }

  var color_code = document.getElementById(this.disp_id+"_color_code");
  if (color_code) {
    this.addEvent(color_code, "mousedown", function(){ __this.clear_blur_timer(true); });
  }
  var btn_color_code = document.getElementById(this.disp_id+"_btn_color_code");
  if (btn_color_code) {
    this.addEvent(btn_color_code, "mousedown", function(){ __this.clear_blur_timer(true); });
    this.addEvent(btn_color_code, "click", function()
                {
                  __this.setFormValue((color_code)?(color_code.value):"");
                  if (__this.func) {
                    __this.func();
                  }
                  __this.hide();
                }
              );
  }

// DRAG BY PROTOTYPE.JS >>>
/*
// 2007.10.09 Dragging
  dispElem.onmousedown = this.onMouseDown;
  dispElem.onmousemove = this.onMouseMove;
  dispElem.onmouseup = this.onMouseUp;
*/
  this.draggable = new Draggable(dispElem.id, {revert:false, starteffect:"", endeffect:"", zindex:__this.zindex});
// DRAG BY PROTOTYPE.JS <<<

  if (isNaN(x) || isNaN(y)) {
    var pos = ThetisPalette._getPos(paintarea, true);

    // for <input type="hidden" ... > on FireFox
    if (pos.x == 0 && pos.y == 0 && paintarea.clientWidth == 0) {
      pos = ThetisPalette._getPos(document.getElementById(this.disp_id), true);
    }

    if (!is_Opera) {
      if (is_dtdStandard || !is_MS) {
        var scroll = ThetisPalette._getScroll(paintarea)
        pos.x -= scroll.left;
        pos.y -= scroll.top;
      }
    }

    dispElem.style.left = (pos.x + paintarea.clientWidth) + "px";
    dispElem.style.top = pos.y + "px";

    this.clear_blur_timer(false);

  } else {
    dispElem.style.left = x + "px";
    dispElem.style.top = y + "px";
  }
  this._show();
};

var _appName = window.navigator.appName;
var is_MS = (_appName.toLowerCase().indexOf("explorer") >= 0);       // MSIE, Sleipnir
//var is_Netscape = (_appName.toLowerCase().indexOf("netscape") >= 0); // Firefox, Safari
var is_Opera = (_appName.toLowerCase().indexOf("opera") >= 0);       // Opera

var is_dtdStandard = (document.compatMode == "CSS1Compat");

ThetisPalette._getPos = function (elem, flag) {

  var change_display = false;
  try {
    if (elem.style.display == "none") {
      elem.style.display = "block";
      change_display = true;
    }
  } catch (e) {}

  var obj = new Object();
  obj.x = elem.offsetLeft;
  obj.y = elem.offsetTop;

  var e = elem;
  while (e.offsetParent && (flag || e.offsetParent.style.position != "absolute")) {
    e = e.offsetParent;
    obj.x += e.offsetLeft;
    obj.y += e.offsetTop;
  }

  if (change_display) {
    elem.style.display = "none";
  }
  return obj;
}

ThetisPalette._getScroll = function (elem) {
  var obj = new Object();
  obj.left = 0;
  obj.top = 0;

  while (elem.parentNode.tagName.toLowerCase() != "html") {
    elem = elem.parentNode;
    if (elem.style != null && 
            (elem.style.overflow=="scroll") || (elem.style.overflow=="auto")) {
      obj.left += elem.scrollLeft;
      obj.top += elem.scrollTop;
    }
  }
  return obj;
}

/* DRAG BY PROTOTYPE.JS >>>
// 2007.10.09 Dragging

ThetisPalette._within = function(elem, x, y) {
  var elemPos = ThetisPalette._getPos(elem, true);
  var eX = elemPos.x;
  var eY = elemPos.y;
  var eWidth = elem.offsetWidth;
  var eHeight = elem.offsetHeight;

  if (is_Opera || (is_MS && !is_dtdStandard)) {
    var scroll = ThetisPalette._getScroll(elem);
    eX -= scroll.left;
    eY -= scroll.top;
  }
//alert("x="+x+", y="+y+"\neX="+eX+", eY="+eY+", eWidth="+eWidth+", eHeight="+eHeight);

  return(x >= eX && x <= eX + eWidth && y >= eY && y <= eY + eHeight);
}


ThetisPalette._getBodyScroll = function()
{
  var obj = new Object();
  obj.left = 0;
  obj.top = 0;

  if (document.documentElement != null) {
     obj.left = document.documentElement.scrollLeft;
     obj.top = document.documentElement.scrollTop;
  }
  if (document.body != null) {
    if (isNaN(obj.left) || obj.left == 0) {
      obj.left = document.body.scrollLeft;
    }
    if (isNaN(obj.top) || obj.top == 0) {
      obj.top = document.body.scrollTop;
    }
  }
  return obj;
}

ThetisPalette.prototype.onMouseDown = function (e) {
  var acceptArray = [
    this.id+"_handle"
  ];

  var bodyScroll = ThetisPalette._getBodyScroll();

  for (var i=0; i < acceptArray.length; i++) {
    var acceptCtrl = document.getElementById(acceptArray[i]);
    if (acceptCtrl == null) {
      continue;
    }
    var within = false;
    if (document.all) {
      within = ThetisPalette._within(acceptCtrl, bodyScroll.left+event.clientX, bodyScroll.top+event.clientY);
    } else if (document.getElementById) {
      within = ThetisPalette._within(acceptCtrl, bodyScroll.left+e.clientX, bodyScroll.top+e.clientY);
    }
    if (within != true) {
      return true;
    }
  }

  this.selected = true;
  if (document.all) {
    this.offsetX = event.clientX + bodyScroll.left - parseInt(this.style.left);
    this.offsetY = event.clientY + bodyScroll.top - parseInt(this.style.top);
  } else if (document.getElementById) {
    this.offsetX = e.pageX - parseInt(this.style.left);
    this.offsetY = e.pageY - parseInt(this.style.top);
  }
  return false;
}

ThetisPalette.prototype.onMouseMove = function(e) {
  if (!this.selected) {
    return true;
  }

  var l, t;
  if (document.all) {
    var bodyScroll = ThetisPalette._getBodyScroll();
    l = event.clientX + bodyScroll.left - this.offsetX;
    t = event.clientY + bodyScroll.top - this.offsetY;
  } else if (document.getElementById) {
    l = e.pageX - this.offsetX;
    t = e.pageY - this.offsetY;
  }
  if (l >= 0 && t >= 0 && l <= 5000 && t <= 10000) {
    this.style.left = l + "px";
    this.style.top = t + "px";
  } else {
    this.selected = false;
    try {
      document.selection.empty();
    } catch(e){}
  }
  return false;
}

ThetisPalette.prototype.onMouseUp = function(e) {
  this.selected = false;
}
// 2007.10.09 Dragging
 DRAG BY PROTOTYPE.JS <<< */

