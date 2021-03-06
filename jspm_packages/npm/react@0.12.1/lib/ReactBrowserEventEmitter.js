/* */ 
(function(process) {
  "use strict";
  var EventConstants = require("./EventConstants");
  var EventPluginHub = require("./EventPluginHub");
  var EventPluginRegistry = require("./EventPluginRegistry");
  var ReactEventEmitterMixin = require("./ReactEventEmitterMixin");
  var ViewportMetrics = require("./ViewportMetrics");
  var assign = require("./Object.assign");
  var isEventSupported = require("./isEventSupported");
  var alreadyListeningTo = {};
  var isMonitoringScrollValue = false;
  var reactTopListenersCounter = 0;
  var topEventMapping = {
    topBlur: 'blur',
    topChange: 'change',
    topClick: 'click',
    topCompositionEnd: 'compositionend',
    topCompositionStart: 'compositionstart',
    topCompositionUpdate: 'compositionupdate',
    topContextMenu: 'contextmenu',
    topCopy: 'copy',
    topCut: 'cut',
    topDoubleClick: 'dblclick',
    topDrag: 'drag',
    topDragEnd: 'dragend',
    topDragEnter: 'dragenter',
    topDragExit: 'dragexit',
    topDragLeave: 'dragleave',
    topDragOver: 'dragover',
    topDragStart: 'dragstart',
    topDrop: 'drop',
    topFocus: 'focus',
    topInput: 'input',
    topKeyDown: 'keydown',
    topKeyPress: 'keypress',
    topKeyUp: 'keyup',
    topMouseDown: 'mousedown',
    topMouseMove: 'mousemove',
    topMouseOut: 'mouseout',
    topMouseOver: 'mouseover',
    topMouseUp: 'mouseup',
    topPaste: 'paste',
    topScroll: 'scroll',
    topSelectionChange: 'selectionchange',
    topTextInput: 'textInput',
    topTouchCancel: 'touchcancel',
    topTouchEnd: 'touchend',
    topTouchMove: 'touchmove',
    topTouchStart: 'touchstart',
    topWheel: 'wheel'
  };
  var topListenersIDKey = "_reactListenersID" + String(Math.random()).slice(2);
  function getListeningForDocument(mountAt) {
    if (!Object.prototype.hasOwnProperty.call(mountAt, topListenersIDKey)) {
      mountAt[topListenersIDKey] = reactTopListenersCounter++;
      alreadyListeningTo[mountAt[topListenersIDKey]] = {};
    }
    return alreadyListeningTo[mountAt[topListenersIDKey]];
  }
  var ReactBrowserEventEmitter = assign({}, ReactEventEmitterMixin, {
    ReactEventListener: null,
    injection: {injectReactEventListener: function(ReactEventListener) {
        ReactEventListener.setHandleTopLevel(ReactBrowserEventEmitter.handleTopLevel);
        ReactBrowserEventEmitter.ReactEventListener = ReactEventListener;
      }},
    setEnabled: function(enabled) {
      if (ReactBrowserEventEmitter.ReactEventListener) {
        ReactBrowserEventEmitter.ReactEventListener.setEnabled(enabled);
      }
    },
    isEnabled: function() {
      return !!(ReactBrowserEventEmitter.ReactEventListener && ReactBrowserEventEmitter.ReactEventListener.isEnabled());
    },
    listenTo: function(registrationName, contentDocumentHandle) {
      var mountAt = contentDocumentHandle;
      var isListening = getListeningForDocument(mountAt);
      var dependencies = EventPluginRegistry.registrationNameDependencies[registrationName];
      var topLevelTypes = EventConstants.topLevelTypes;
      for (var i = 0,
          l = dependencies.length; i < l; i++) {
        var dependency = dependencies[i];
        if (!(isListening.hasOwnProperty(dependency) && isListening[dependency])) {
          if (dependency === topLevelTypes.topWheel) {
            if (isEventSupported('wheel')) {
              ReactBrowserEventEmitter.ReactEventListener.trapBubbledEvent(topLevelTypes.topWheel, 'wheel', mountAt);
            } else if (isEventSupported('mousewheel')) {
              ReactBrowserEventEmitter.ReactEventListener.trapBubbledEvent(topLevelTypes.topWheel, 'mousewheel', mountAt);
            } else {
              ReactBrowserEventEmitter.ReactEventListener.trapBubbledEvent(topLevelTypes.topWheel, 'DOMMouseScroll', mountAt);
            }
          } else if (dependency === topLevelTypes.topScroll) {
            if (isEventSupported('scroll', true)) {
              ReactBrowserEventEmitter.ReactEventListener.trapCapturedEvent(topLevelTypes.topScroll, 'scroll', mountAt);
            } else {
              ReactBrowserEventEmitter.ReactEventListener.trapBubbledEvent(topLevelTypes.topScroll, 'scroll', ReactBrowserEventEmitter.ReactEventListener.WINDOW_HANDLE);
            }
          } else if (dependency === topLevelTypes.topFocus || dependency === topLevelTypes.topBlur) {
            if (isEventSupported('focus', true)) {
              ReactBrowserEventEmitter.ReactEventListener.trapCapturedEvent(topLevelTypes.topFocus, 'focus', mountAt);
              ReactBrowserEventEmitter.ReactEventListener.trapCapturedEvent(topLevelTypes.topBlur, 'blur', mountAt);
            } else if (isEventSupported('focusin')) {
              ReactBrowserEventEmitter.ReactEventListener.trapBubbledEvent(topLevelTypes.topFocus, 'focusin', mountAt);
              ReactBrowserEventEmitter.ReactEventListener.trapBubbledEvent(topLevelTypes.topBlur, 'focusout', mountAt);
            }
            isListening[topLevelTypes.topBlur] = true;
            isListening[topLevelTypes.topFocus] = true;
          } else if (topEventMapping.hasOwnProperty(dependency)) {
            ReactBrowserEventEmitter.ReactEventListener.trapBubbledEvent(dependency, topEventMapping[dependency], mountAt);
          }
          isListening[dependency] = true;
        }
      }
    },
    trapBubbledEvent: function(topLevelType, handlerBaseName, handle) {
      return ReactBrowserEventEmitter.ReactEventListener.trapBubbledEvent(topLevelType, handlerBaseName, handle);
    },
    trapCapturedEvent: function(topLevelType, handlerBaseName, handle) {
      return ReactBrowserEventEmitter.ReactEventListener.trapCapturedEvent(topLevelType, handlerBaseName, handle);
    },
    ensureScrollValueMonitoring: function() {
      if (!isMonitoringScrollValue) {
        var refresh = ViewportMetrics.refreshScrollValues;
        ReactBrowserEventEmitter.ReactEventListener.monitorScrollValue(refresh);
        isMonitoringScrollValue = true;
      }
    },
    eventNameDispatchConfigs: EventPluginHub.eventNameDispatchConfigs,
    registrationNameModules: EventPluginHub.registrationNameModules,
    putListener: EventPluginHub.putListener,
    getListener: EventPluginHub.getListener,
    deleteListener: EventPluginHub.deleteListener,
    deleteAllListeners: EventPluginHub.deleteAllListeners
  });
  module.exports = ReactBrowserEventEmitter;
})(require("github:jspm/nodelibs@0.0.7/process"));
