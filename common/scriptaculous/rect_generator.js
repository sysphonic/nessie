// script.aculo.us slider.js v1.9.0, Thu Dec 23 16:54:48 -0500 2010

// Copyright (c) 2005-2010 Marty Haught, Thomas Fuchs
//
// script.aculo.us is freely distributable under the terms of an MIT-style license.
// For details, see the script.aculo.us web site: http://script.aculo.us/

/*
 * 2015-04-24 Shin@Sysphonic
 * Control.SpanSelector: Modified from Control.Slider in scriptaculous.
 */

if (!Control) var Control = { };

// options:
//  axis: 'vertical', or 'horizontal' (default)
//
// callbacks:
//  onBeginSlide(value)
//  onChange(value)
//  onSlide(value)
Control.RectGenerator = Class.create({
  initialize: function(hdl, tck, options) {
    var slider = this;

    this.handle = $(hdl);

    this.track   = $(tck);
    this.options = options || { };

    this.axis      = this.options.axis || 'both';
    this.rangeX     = this.options.rangeX || $R(0,1);
    this.rangeY     = this.options.rangeY || $R(0,1);

    this.value     = 0;
/*
    this.spans     = this.options.spans ? this.options.spans.map(function(s){ return $(s) }) : false;
    this.options.startSpan = $(this.options.startSpan || null);
    this.options.endSpan   = $(this.options.endSpan || null);

    this.maximum   = this.options.maximum || this.range.end;
    this.minimum   = this.options.minimum || this.range.start;
*/

    // Will be used to align the handle onto the track, if necessary
    this.alignX = parseInt(this.options.alignX || '0');
    this.alignY = parseInt(this.options.alignY || '0');

//    this.trackLength = this.maximumOffset() - this.minimumOffset();

    this.handleLength = new Object();
    if (this.isVertical()) {
      if (this.handle.offsetHeight != 0) {
        this.handleLength.y = this.handle.offsetHeight;
      } else {
        this.handleLength.y = this.handle.style.height.replace(/px$/,"");
      }
    }
    if (this.isHorizontal()) {
      if (this.handle.offsetWidth != 0) {
        this.handleLength.x = this.handle.offsetWidth;
      } else {
        this.handleLength.x = this.handle.style.width.replace(/px$/,"");
      }
    }

    this.active   = false;
    this.dragging = false;
    this.disabled = false;

    if (this.options.disabled) this.setDisabled();

    this.eventMouseDown = this.startDrag.bindAsEventListener(this);
    this.eventMouseUp   = this.endDrag.bindAsEventListener(this);
    this.eventMouseMove = this.update.bindAsEventListener(this);

    // Initialize handle
    slider.setValue(
        {
          x: parseFloat(slider.options.sliderValue.x || slider.rangeX.start),
          y: parseFloat(slider.options.sliderValue.y || slider.rangeY.start)
        }
      );
    this.handle.makePositioned().observe("mousedown", slider.eventMouseDown);

    this.track.observe("mousedown", this.eventMouseDown);
    document.observe("mouseup", this.eventMouseUp);
    document.observe("mousemove", this.eventMouseMove);

    this.initialized = true;
  },
  dispose: function() {
    var slider = this;
    Event.stopObserving(this.track, "mousedown", this.eventMouseDown);
    Event.stopObserving(document, "mouseup", this.eventMouseUp);
    Event.stopObserving(document, "mousemove", this.eventMouseMove);
    Event.stopObserving(this.handle, "mousedown", slider.eventMouseDown);
  },
  setDisabled: function(){
    this.disabled = true;
  },
  setEnabled: function(){
    this.disabled = false;
  },
  getNearestValue: function(pos){
    var x = pos.x;
    var y = pos.y;
    if (x > this.rangeX.end) x = this.rangeX.end;
    if (x < this.rangeX.start) x = this.rangeX.start;
    if (y > this.rangeY.end) y = this.rangeY.end;
    if (y < this.rangeY.start) y = this.rangeY.start;
    return {x: x, y: y};
  },
  setValue: function(sliderValue){
    if (!this.active) {
      this.activeHandleIdx = 0;
      this.activeHandle    = this.handle;
      this.updateStyles();
    }
    sliderValue = this.getNearestValue(sliderValue);
    this.value = sliderValue;

    if (this.isVertical()) {
      this.handle.style["top"] = this.translateToPx(sliderValue.y);
    }
    if (this.isHorizontal()) {
      this.handle.style["left"] = this.translateToPx(sliderValue.x);
    }

//    this.drawSpans();
//    if (!this.dragging || !this.event) this.updateFinished();
  },
  translateToPx: function(value) {
    return (value + "px");
/*
    return Math.round(
      ((this.trackLength-this.handleLength)/(this.range.end-this.range.start)) *
      (value - this.range.start)) + "px";
*/
  },
  translateToValue: function(offset) {
    return offset;
/*
    return ((offset/(this.trackLength-this.handleLength) *
      (this.range.end-this.range.start)) + this.range.start);
*/
  },
/*
  getRange: function(range) {
    var v = this.values.sortBy(Prototype.K);
    range = range || 0;
    return $R(v[range],v[range+1]);
  },
  minimumOffset: function(){
    return(this.isVertical() ? this.alignY : this.alignX);
  },
  maximumOffset: function(){
    return(this.isVertical() ?
      (this.track.offsetHeight != 0 ? this.track.offsetHeight :
        this.track.style.height.replace(/px$/,"")) - this.alignY :
      (this.track.offsetWidth != 0 ? this.track.offsetWidth :
        this.track.style.width.replace(/px$/,"")) - this.alignX);
  },
*/
  isVertical:  function(){
    return ((this.axis == 'vertical') || (this.axis == 'both'));
  },
  isHorizontal:  function(){
    return ((this.axis == 'horizontal') || (this.axis == 'both'));
  },
/*
  drawSpans: function() {
    var slider = this;
    if (this.spans)
      $R(0, this.spans.length-1).each(function(r) { slider.setSpan(slider.spans[r], slider.getRange(r)) });
    if (this.options.startSpan)
      this.setSpan(this.options.startSpan,
        $R(0, this.values.length>1 ? this.getRange(0).min() : this.value ));
    if (this.options.endSpan)
      this.setSpan(this.options.endSpan,
        $R(this.values.length>1 ? this.getRange(this.spans.length-1).max() : this.value, this.maximum));
  },
  setSpan: function(span, range) {
    if (this.isVertical()) {
      span.style.top = this.translateToPx(range.start);
      span.style.height = this.translateToPx(range.end - range.start + this.range.start);
    }
    if (this.isHorizontal()) {
      span.style.left = this.translateToPx(range.start);
      span.style.width = this.translateToPx(range.end - range.start + this.range.start);
    }
  },
*/
  updateStyles: function() {
    Element.removeClassName(this.handle, "selected");
    Element.addClassName(this.activeHandle, "selected");
  },
  startDrag: function(event) {
    if (Event.isLeftClick(event)) {
      if (!this.disabled){
        this.active = true;

        var hdl = Event.element(event);
        var pointer  = [Event.pointerX(event), Event.pointerY(event)];
        var tck = hdl;
        if (tck == this.track) {
          var offsets  = this.track.cumulativeOffset();
          this.event = event;
          this.setValue(
              {
                x: this.translateToValue((pointer[0]-offsets[0])-(this.handleLength.x/2)),
                y: this.translateToValue((pointer[1]-offsets[1])-(this.handleLength.y/2))
              }
            );
          var offsets  = this.activeHandle.cumulativeOffset();
          this.offsetX = (pointer[0] - offsets[0]);
          this.offsetY = (pointer[1] - offsets[1]);
        } else {
          // find the handle (prevents issues with Safari)
          while((this.handle != hdl) && hdl.parentNode)
            hdl = hdl.parentNode;

          if (this.handle == hdl) {
            this.activeHandle    = hdl;
            this.activeHandleIdx = 0;
            this.updateStyles();

            var offsets  = this.activeHandle.cumulativeOffset();
            this.offsetX = (pointer[0] - offsets[0]);
            this.offsetY = (pointer[1] - offsets[1]);
          }
        }
        if (this.options.onBeginSlide) {
          this.options.onBeginSlide(this.value, this);
        }
      }
      Event.stop(event);
    }
  },
  update: function(event) {
   if (this.active) {
      if (!this.dragging) this.dragging = true;
      this.draw(event);
      if (Prototype.Browser.WebKit) window.scrollBy(0,0);
      Event.stop(event);
   }
  },
  draw: function(event) {
    var pointer = [Event.pointerX(event), Event.pointerY(event)];
    var offsets = this.track.cumulativeOffset();
    pointer[0] -= this.offsetX + offsets[0];
    pointer[1] -= this.offsetY + offsets[1];
    this.event = event;

    this.setValue(
        {
          x: this.translateToValue(pointer[0]),
          y: this.translateToValue(pointer[1])
        }
      );
    if (this.initialized && this.options.onSlide)
      this.options.onSlide(this.value, this);
  },
  endDrag: function(event) {
    if (this.active && this.dragging) {
      this.finishDrag(event, true);
      Event.stop(event);
    }
    this.active = false;
    this.dragging = false;
  },
  finishDrag: function(event, success) {
    this.active = false;
    this.dragging = false;
    this.updateFinished();
  },
  updateFinished: function() {
    if (this.initialized && this.options.onChange)
      this.options.onChange(this.value, this);
    this.event = null;
  }
});

