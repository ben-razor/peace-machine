"use strict";$(function(){function a(a){return a.originalEvent&&a.originalEvent.touches}function b(a){return physii.math.loneRanger(a,-Math.PI,Math.PI,0,2*Math.PI)}function c(a){var c=b(a);return c=physii.math.loneRanger(c,Math.PI/4,7*Math.PI/4,0,1),c}function d(a){var b=physii.math.loneRanger(a,0,1,Math.PI/4,7*Math.PI/4),c=physii.math.loneRanger(b,0,2*Math.PI,-Math.PI,Math.PI);return c}function f(a,b){if(k){var d=k,e=d.width(),f=d.height(),g=0,j=0,l=d[0].getBoundingClientRect(),e=l.width,f=l.height,m=d.offset();g=a-(m.left+e/2),j=b-(m.top+f/2);var n=-j,o=g,p=Math.atan2(o,n),q=c(p),r=d.attr("id");if("pm-control-uppers"===r){var s=physii.math.loneRanger(q,0,1,-24,0);q=h(s)}i(r,q),p>3*Math.PI/4?p=3*Math.PI/4:p<-3*Math.PI/4&&(p=-3*Math.PI/4),d.css("transform","translate(-50%, 0%)  rotate("+p+"rad)")}}function g(){return"PeaceMachineInterface"in window}function h(a){var b=Math.pow(10,a/20);return b}function i(a,b){p.setItem(a,JSON.stringify(b)),o&&o.handleFloat(a,b)}function j(a){var b=JSON.parse(p.getItem(a));return b}var k=null,l=$(".rotatable"),m=0,n=0,o=window.PeaceMachineInterface||pMachine.audio,p=window.localStorage;l.bind("mousedown touchstart",function(a){a.stopPropagation(),a.preventDefault(),k=$(a.target)}),l.bind("touchend",function(a){a.stopPropagation(),k=null}),$(document.body).bind("mousemove touchmove",function(b){var c=b;a(b)&&(c=b.originalEvent.touches[0]),m=c.pageX,n=c.pageY,f(m,n),b.stopPropagation()}),$(document.body).bind("mouseup mouseleave",function(){k=null}),function(){g()||$(".web-show").css("display","");for(var a=["pm-control-uppers","pm-control-downers"],b=0;b<a.length;b++){var c=a[b],e=$("#"+c),f=j(c),h=d(f);e.css("transform","translate(-50%, 0%)  rotate("+h+"rad)"),o&&o.handleFloat(c,f)}}()});