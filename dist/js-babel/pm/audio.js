'use strict';function _createForOfIteratorHelper(a,b){var c;if("undefined"==typeof Symbol||null==a[Symbol.iterator]){if(Array.isArray(a)||(c=_unsupportedIterableToArray(a))||b&&a&&"number"==typeof a.length){c&&(a=c);var d=0,e=function(){};return{s:e,n:function n(){return d>=a.length?{done:!0}:{done:!1,value:a[d++]}},e:function e(a){throw a},f:e}}throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")}var f,g=!0,h=!1;return{s:function s(){c=a[Symbol.iterator]()},n:function n(){var a=c.next();return g=a.done,a},e:function e(a){h=!0,f=a},f:function f(){try{g||null==c["return"]||c["return"]()}finally{if(h)throw f}}}}function _unsupportedIterableToArray(a,b){if(a){if("string"==typeof a)return _arrayLikeToArray(a,b);var c=Object.prototype.toString.call(a).slice(8,-1);return"Object"===c&&a.constructor&&(c=a.constructor.name),"Map"===c||"Set"===c?Array.from(a):"Arguments"===c||/^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(c)?_arrayLikeToArray(a,b):void 0}}function _arrayLikeToArray(a,b){(null==b||b>a.length)&&(b=a.length);for(var c=0,d=Array(b);c<b;c++)d[c]=a[c];return d}function _classCallCheck(a,b){if(!(a instanceof b))throw new TypeError("Cannot call a class as a function")}function _defineProperties(a,b){for(var c,d=0;d<b.length;d++)c=b[d],c.enumerable=c.enumerable||!1,c.configurable=!0,"value"in c&&(c.writable=!0),Object.defineProperty(a,c.key,c)}function _createClass(a,b,c){return b&&_defineProperties(a.prototype,b),c&&_defineProperties(a,c),a}var pMachine=pMachine||{};(function(a){function b(){var a=window.AudioContext||window.webkitAudioContext;i=new a,j=i.createBiquadFilter(),k=i.createGain(),k.gain.value=0,k.connect(i.destination),j.connect(k),f(i,j)}function c(){clearTimeout(l),a.handleTurnOn()}function d(){if(i){var a=i.currentTime;k.gain.linearRampToValueAtTime(0,a+2)}l=setTimeout(function(){i.close(),i=null},2000)}function e(a){var b=function(){var b=0,c=a.createScriptProcessor(4096,1,1);return c.onaudioprocess=function(a){for(var c,d=a.outputBuffer.getChannelData(0),e=0;4096>e;e++)c=2*Math.random()-1,d[e]=(b+.02*c)/1.02,b=d[e],d[e]*=2},c}();return b}function f(b,c){var d,f=a.config.vibes,g=_createForOfIteratorHelper(f);try{for(g.s();!(d=g.n()).done;){var h=d.value,i=h.audio,j=h.id,k=-1!=i.indexOf(".");if(k)(function(){var a=new XMLHttpRequest;a.open("GET","audio/"+i,!0),a.responseType="arraybuffer",a.vibeID=j,a.onload=function(){var d=a.response,e=a.vibeID;b.decodeAudioData(d,function(a){m=b.createBufferSource(),m.buffer=a,m.playbackRate.value=1,m.loop=!0,m.start(0),n[e]=new o(m).connect(c).setVolume(0,0)},function(a){"Error decoding audio"+a.err})},a.send()})();else if("beige_haze"===j){var l=e(b,c);n[j]=new o(l).connect(c).setVolume(0,0)}}}catch(a){g.e(a)}finally{g.f()}}function g(a,b,c){if(i){var d=i.currentTime;console.log(JSON.stringify([a,b])),"pm-control-downers"==a?j.frequency.linearRampToValueAtTime(800*b,d+c):"pm-control-uppers"==a&&k.gain.linearRampToValueAtTime(b,d+c)}}var h=a.audio={},i=null,j=null,k=null,l=null;h.initAudio=b,h.turnOn=c,h.turnOff=d;var m=null,n={};a.sources=n;var o=function(){function a(b){_classCallCheck(this,a),this.source=b,this.gain=i.createGain(),this.gain.gain.value=0,this.source.connect(this.gain)}return _createClass(a,[{key:"connect",value:function connect(a){return this.gain.connect(a),this}},{key:"setVolume",value:function setVolume(a,b){var c=i.currentTime;return this.gain.gain.linearRampToValueAtTime(a,c+b),this}}]),a}();h.handleFloat=g,h.selectVibe=function(a){for(var b=0,c=Object.keys(n);b<c.length;b++){var d=c[b],e=n[d];d===a?e.setVolume(1,1):e.setVolume(0,1)}}})(pMachine);