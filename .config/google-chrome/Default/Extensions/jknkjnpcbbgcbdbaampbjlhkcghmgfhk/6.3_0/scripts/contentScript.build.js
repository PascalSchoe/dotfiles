var vb=vb||{};vb.contentScript=function(e){function t(i){if(n[i])return n[i].exports;var r=n[i]={i:i,l:!1,exports:{}};return e[i].call(r.exports,r,r.exports,t),r.l=!0,r.exports}var n={};return t.m=e,t.c=n,t.d=function(e,n,i){t.o(e,n)||Object.defineProperty(e,n,{configurable:!1,enumerable:!0,get:i})},t.n=function(e){var n=e&&e.__esModule?function(){return e.default}:function(){return e};return t.d(n,"a",n),n},t.o=function(e,t){return Object.prototype.hasOwnProperty.call(e,t)},t.p="",t(t.s=145)}({145:function(e,t,n){"use strict";function i(e){if(!0===/.+\/(results|watch).+/.test(window.location.href)&&(e=!0),document.getElementById("vb-trending")&&document.getElementById("vb-trending").remove(),!0===/feed\/trending/.test(window.location.href)){var t=document.createElement("style");t.type="text/css",t.id="vb-trending",t.appendChild(document.createTextNode("ytd-grid-video-renderer, ytd-shelf-renderer, ytd-compact-video-renderer, ytd-video-renderer, ytd-playlist-video-renderer, ytd-playlist-panel-video-renderer, ytd-playlist-renderer, ytd-radio-renderer, ytd-compact-radio-renderer, ytd-compact-playlist-renderer, ytd-comment-renderer, ytd-channel-renderer, ytd-mini-channel-renderer, ytd-grid-channel-renderer, .ytp-videowall-still, #page li.yt-shelf-grid-item, #page .expanded-shelf-content-list .expanded-shelf-content-item-wrapper, #page #results .item-section .yt-lockup-video, #page #results .item-section .yt-lockup-playlist, #page #results .item-section .yt-lockup-channel, #page .pl-video-table .pl-video, #page .playlist-videos-list .yt-uix-scroller-scroll-unit, #page .feed-item-container, #page .video-list .video-list-item, #page .comment-renderer, #page .ytp-videowall-still { visibility: visible; }")),document.getElementsByTagName("head")[0].appendChild(t)}var n=r.b;r.a()&&(n=r.c),o.g(function(t){var i=!1,a=!1,l=!1;if(r.a()?(null!==document.querySelector("#content .branded-page-header-title .branded-page-header-title-link")?a=document.querySelector("#content .branded-page-header-title .branded-page-header-title-link").textContent.trim():null!==document.querySelector("#watch7-main #watch-header .yt-user-info a")&&(a=document.querySelector("#watch7-main #watch-header .yt-user-info a").textContent.trim()),null!==document.querySelector("#watch7-main #watch-header #watch-headline-title h1")&&(l=document.querySelector("#watch7-main #watch-header #watch-headline-title h1").textContent.trim())):(null!==document.querySelector("#channel-container #channel-title")?a=document.querySelector("#channel-container #channel-title").textContent.trim():null!==document.querySelector("#main #meta.ytd-watch #owner-name>a")&&(a=document.querySelector("#main #meta.ytd-watch #owner-name>a").textContent.trim()),null!==document.querySelector("#main #info.ytd-watch .title")&&(l=document.querySelector("#main #info.ytd-watch .title").textContent.trim())),a||l){var c=!0,d=!1,s=void 0;try{for(var u,y=t[Symbol.iterator]();!(c=(u=y.next()).done);c=!0){var f=u.value,m=f.key.match(/^\/(.+)\/(.+)?$/),v=!1;try{v=new RegExp(m[1],m[2])}catch(e){}switch(f.type){case"channel":a&&(v&&v.test(a)||!v&&f.key===a)&&(i=!0);break;case"wildcard":a&&a.toLowerCase().indexOf(f.key.toLowerCase())>-1&&(i=!0);break;case"keyword":l&&(v&&v.test(l)||!v&&l.toLowerCase().indexOf(f.key.toLowerCase())>-1)&&(i=!0)}if(i){o.h("tools","redirect",function(e){e&&(!0===/.+&?list=.+/.test(window.location.href)?setTimeout(function(){window.location.replace(document.body.querySelector("#player .ytp-next-button").href)},350):window.location.replace("/"))});break}}}catch(e){d=!0,s=e}finally{try{!c&&y.return&&y.return()}finally{if(d)throw s}}}var p=!0,h=!1,b=void 0;try{for(var w,g=n[Symbol.iterator]();!(p=(w=g.next()).done);p=!0){var k=w.value,x=document.querySelectorAll(e?k.container:k.container+":not(.videoblocker-allowed)"),S=!0,O=!1,q=void 0;try{for(var C,L=x[Symbol.iterator]();!(S=(C=L.next()).done);S=!0){var E=C.value;(function(n){if(!e&&n.classList.contains("videoblocker-blocked"))return"continue";var i=!1,r=!!k.channelname&&(!!n.querySelector(k.channelname)&&n.querySelector(k.channelname).textContent.trim()),o=!!k.videotitle&&(!!n.querySelector(k.videotitle)&&n.querySelector(k.videotitle).textContent.trim());if(!r&&!o)return"continue";r&&".ytp-videowall-still"===k.container&&r.indexOf("•")>-1&&(r=r.substr(0,r.indexOf("•")).trim()),new Promise(function(e,a){var l=!0,c=!1,d=void 0;try{for(var s,u=t[Symbol.iterator]();!(l=(s=u.next()).done);l=!0){var y=s.value,f=y.key.match(/^\/(.+)\/(.+)?$/),m=!1;try{m=new RegExp(f[1],f[2])}catch(e){}switch(y.type){case"channel":r&&(m&&m.test(r)||!m&&y.key===r)&&(i=!0);break;case"wildcard":r&&r.toLowerCase().indexOf(y.key.toLowerCase())>-1&&(i=!0);break;case"keyword":o&&(m&&m.test(o)||!m&&o.toLowerCase().indexOf(y.key.toLowerCase())>-1)&&(i=!0)}if(i){n.classList.remove("videoblocker-allowed"),n.classList.add("videoblocker-blocked");break}}}catch(e){c=!0,d=e}finally{try{!l&&u.return&&u.return()}finally{if(c)throw d}}e(i)}).then(function(e){e||(n.classList.remove("videoblocker-blocked"),n.classList.add("videoblocker-allowed"))})})(E)}}catch(e){O=!0,q=e}finally{try{!S&&L.return&&L.return()}finally{if(O)throw q}}}}catch(e){h=!0,b=e}finally{try{!p&&g.return&&g.return()}finally{if(h)throw b}}})}Object.defineProperty(t,"__esModule",{value:!0}),t.hideVideos=i;var r=n(146),o=n(3),a=n(147),l=n.n(a);document.addEventListener("DOMContentLoaded",function(e){if(o.i(function(e){e.version.updated&&chrome.runtime.sendMessage({name:"extensionUpdated"}),e.version.installed&&chrome.runtime.sendMessage({name:"extensionInstalled"}),Date.now()-e.version.timestamp>2592e6&&chrome.runtime.sendMessage({name:"extensionThanks"})}),r.a()){new MutationObserver(l()(function(){i(!1)},500,{leading:!1,maxWait:100})).observe(document.getElementById("page"),{childList:!0,subtree:!0})}else document.addEventListener("yt-visibility-refresh",l()(function(){i(!1)},500,{leading:!1,maxWait:250}))}),chrome.runtime.onMessage.addListener(function(e,t,n){switch(e.name){case"contextMenuClicked":c&&o.a({key:c,type:"channel"})}return!0});var c=void 0;window.addEventListener("contextmenu",function(e){c=null;var t=r.b;r.a()&&(t=r.c);var n=!0,i=!1,o=void 0;try{for(var a,l=t[Symbol.iterator]();!(n=(a=l.next()).done);n=!0){var d=a.value;if(e.target.closest(d.container)&&(c=e.target.closest(d.container).querySelector(d.channelname).textContent.trim(),".ytp-videowall-still"===d.container&&c.indexOf("•")>-1&&(c=c.substr(0,c.indexOf("•")).trim())),c)break}}catch(e){i=!0,o=e}finally{try{!n&&l.return&&l.return()}finally{if(i)throw o}}})},146:function(e,t,n){"use strict";function i(){return!!document.querySelector("body#body")}t.a=i,n.d(t,"b",function(){return r}),n.d(t,"c",function(){return o});var r=[{container:"ytd-grid-video-renderer",videotitle:"#video-title",channelname:"#byline"},{container:"ytd-shelf-renderer",channelname:"#title-container #title"},{container:"ytd-compact-video-renderer",videotitle:"#video-title",channelname:"#byline"},{container:"ytd-video-renderer",videotitle:"#video-title",channelname:"#byline"},{container:"ytd-playlist-video-renderer",videotitle:"#video-title",channelname:"#byline"},{container:"ytd-playlist-panel-video-renderer",videotitle:"#video-title",channelname:"#byline"},{container:"ytd-playlist-renderer",videotitle:"#video-title",channelname:"#byline"},{container:"ytd-radio-renderer",videotitle:"#video-title",channelname:"#byline"},{container:"ytd-compact-radio-renderer",videotitle:"#video-title",channelname:"#byline"},{container:"ytd-compact-playlist-renderer",videotitle:"#video-title",channelname:"#byline"},{container:"ytd-comment-renderer",videotitle:"#content-text",channelname:"#author-text"},{container:"ytd-channel-renderer",channelname:"#channel-title > span"},{container:"ytd-mini-channel-renderer",channelname:"span.title"},{container:"ytd-grid-channel-renderer",channelname:"#title"},{container:".ytp-videowall-still",videotitle:".ytp-videowall-still-info-title",channelname:".ytp-videowall-still-info-author"}],o=[{container:"li.yt-shelf-grid-item",videotitle:".yt-lockup-title a",channelname:".yt-lockup-byline a"},{container:".expanded-shelf-content-list .expanded-shelf-content-item-wrapper",videotitle:".yt-lockup-title a",channelname:".yt-lockup-byline a"},{container:"#results .item-section .yt-lockup-video",videotitle:".yt-lockup-title a",channelname:".yt-lockup-byline a"},{container:"#results .item-section .yt-lockup-playlist",videotitle:".yt-lockup-title a",channelname:".yt-lockup-byline"},{container:"#results .item-section .yt-lockup-channel",channelname:".yt-lockup-title a"},{container:".pl-video-table .pl-video",videotitle:".pl-video-title-link",channelname:".pl-video-owner a"},{container:".playlist-videos-list .yt-uix-scroller-scroll-unit",videotitle:".playlist-video-description",channelname:".video-uploader-byline"},{container:".feed-item-container",channelname:".branded-page-module-title-text"},{container:".video-list .video-list-item",videotitle:".title",channelname:".attribution"},{container:".comment-renderer",videotitle:".comment-renderer-text-content",channelname:".comment-author-text"},{container:".ytp-videowall-still",videotitle:".ytp-videowall-still-info-title",channelname:".ytp-videowall-still-info-author"}]},147:function(e,t,n){(function(t){function n(e,t,n){function r(t){var n=v,i=p;return v=p=void 0,O=t,b=e.apply(i,n)}function o(e){return O=e,w=setTimeout(s,t),q?r(e):b}function c(e){var n=e-S,i=e-O,r=t-n;return C?k(r,h-i):r}function d(e){var n=e-S,i=e-O;return void 0===S||n>=t||n<0||C&&i>=h}function s(){var e=x();if(d(e))return u(e);w=setTimeout(s,c(e))}function u(e){return w=void 0,L&&v?r(e):(v=p=void 0,b)}function y(){void 0!==w&&clearTimeout(w),O=0,v=S=p=w=void 0}function f(){return void 0===w?b:u(x())}function m(){var e=x(),n=d(e);if(v=arguments,p=this,S=e,n){if(void 0===w)return o(S);if(C)return w=setTimeout(s,t),r(S)}return void 0===w&&(w=setTimeout(s,t)),b}var v,p,h,b,w,S,O=0,q=!1,C=!1,L=!0;if("function"!=typeof e)throw new TypeError(l);return t=a(t)||0,i(n)&&(q=!!n.leading,C="maxWait"in n,h=C?g(a(n.maxWait)||0,t):h,L="trailing"in n?!!n.trailing:L),m.cancel=y,m.flush=f,m}function i(e){var t=typeof e;return!!e&&("object"==t||"function"==t)}function r(e){return!!e&&"object"==typeof e}function o(e){return"symbol"==typeof e||r(e)&&w.call(e)==d}function a(e){if("number"==typeof e)return e;if(o(e))return c;if(i(e)){var t="function"==typeof e.valueOf?e.valueOf():e;e=i(t)?t+"":t}if("string"!=typeof e)return 0===e?e:+e;e=e.replace(s,"");var n=y.test(e);return n||f.test(e)?m(e.slice(2),n?2:8):u.test(e)?c:+e}var l="Expected a function",c=NaN,d="[object Symbol]",s=/^\s+|\s+$/g,u=/^[-+]0x[0-9a-f]+$/i,y=/^0b[01]+$/i,f=/^0o[0-7]+$/i,m=parseInt,v="object"==typeof t&&t&&t.Object===Object&&t,p="object"==typeof self&&self&&self.Object===Object&&self,h=v||p||Function("return this")(),b=Object.prototype,w=b.toString,g=Math.max,k=Math.min,x=function(){return h.Date.now()};e.exports=n}).call(t,n(4))},3:function(e,t,n){"use strict";function i(e){l(h,e),y(b)}function r(e,t){chrome.storage.local.get(function(n){if(void 0===n.settings)l(h,t);else if(e<"6.0"){var i=h;i.tools.redirect=n.settings.redirect,i.tools.pageAction=n.settings.enableicon,i.security.password=n.settings.password,i.version.number=chrome.runtime.getManifest().version,i.version.updated=!0,i.version.installed=!1,l(i,t)}else{var r=n.settings;r.version.updated=!0,l(r,t)}void 0===n.blocklist&&void 0!==n.channels&&y(n.channels)})}function o(e){chrome.storage.local.get("settings",function(t){e(t.settings)})}function a(e,t,n){o(function(i){n(void 0===i[e]?void 0:i[e][t])})}function l(e,t){chrome.storage.local.set({settings:e},function(){chrome.runtime.sendMessage({name:"settingsUpdated"}),t&&t()})}function c(e,t,n,i){o(function(r){void 0===r[e]&&(r[e]={}),r[e][t]=n,l(r,i)})}function d(e){a("storage","sync",function(t){var n=void 0;n=t?chrome.storage.sync:chrome.storage.local,e(n)})}function s(e,t,n){u(function(i){var r=i;c("storage","sync",e,function(){if(e)switch(t){case"merge":m(r,function(e){e?n(!0):c("storage","sync",!1,function(){n(!1)})});break;case"sync":n(!0);break;case"local":y(r,function(e){e?n(!0):c("storage","sync",!1,function(){n(!1)})})}else y(r,function(e){e?n(!0):c("storage","sync",!1,function(){n(!1)})})})})}function u(e){d(function(t){t.get("blocklist",function(t){void 0===t.blocklist&&(t.blocklist=[]),e(t.blocklist)})})}function y(e,t){d(function(n){n.set({blocklist:e},function(){chrome.runtime.sendMessage({name:"itemsUpdated"});var e=!0;void 0!==chrome.runtime.lastError&&chrome.runtime.lastError&&"QUOTA_BYTES_PER_ITEM quota exceeded"===chrome.runtime.lastError.message&&(e=!1),t&&t(e)})})}function f(e,t){u(function(n){""!==e.key&&""!==e.type&&-1===n.findIndex(function(t){return t.key===e.key&&t.type===e.type})&&n.unshift(e),y(n,t)})}function m(e,t){u(function(n){var i=!0,r=!1,o=void 0;try{for(var a,l=e[Symbol.iterator]();!(i=(a=l.next()).done);i=!0){var c=a.value;!function(e){""!==e.key&&""!==e.type&&-1===n.findIndex(function(t){return t.key===e.key&&t.type===e.type})&&n.unshift(e)}(c)}}catch(e){r=!0,o=e}finally{try{!i&&l.return&&l.return()}finally{if(r)throw o}}y(n,t)})}function v(e,t){u(function(n){var i=n.findIndex(function(t){return t.key===e.key&&t.type===e.type});""!==e.key&&""!==e.type&&i>-1&&n.splice(i,1),y(n,t)})}function p(e){y([],e)}t.e=i,t.f=r,t.i=o,t.h=a,t.k=c,t.j=s,t.g=u,t.a=f,t.b=m,t.d=v,t.c=p;var h={version:{number:chrome.runtime.getManifest().version,updated:!1,installed:!0,timestamp:Date.now()},storage:{sync:!1},security:{password:""},tools:{pageAction:!0,contextMenu:!0,redirect:!0}},b=[]},4:function(e,t){var n;n=function(){return this}();try{n=n||Function("return this")()||(0,eval)("this")}catch(e){"object"==typeof window&&(n=window)}e.exports=n}});