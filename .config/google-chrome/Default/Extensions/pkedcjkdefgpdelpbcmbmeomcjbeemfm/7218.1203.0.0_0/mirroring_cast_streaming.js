'use strict';var px={TAB:0,Rj:1,mn:2},qx=function(a){Ab("MediaRouter.CastStreaming.Start.Success",a,px)};var rx=fb("mr.mirror.cast.LogUploader"),tx=function(a,b,c){sx("raw_events.log.gz",a,b,c);return b?"https://crash.corp.google.com/samples?reportid=&q="+encodeURIComponent("UserComments='"+b+"'"):""},sx=function(a,b,c,d){if(0==b.size)rx.info("Trying to upload an empty file to Crash"),d&&d(null);else{var e=new FormData;e.append("prod","Cast");e.append("ver",chrome.runtime.getManifest().version);e.append(a,b);c&&e.append("comments",c);Tu("https://clients2.google.com/cr/report",function(a){a=a.target;
var b=null;cv(a)?(b=dv(a),rx.info("Upload to Crash succeeded: "+b)):rx.info("Upload to Crash failed. HTTP status: "+a.Na());d&&d(b)},"POST",e,void 0,3E4)}};var ux=function(){this.b=0;jj(this)},wx=function(){vx||(vx=new ux);return vx},xx=function(){var a=wx(),b={fraction:.01,autoSubmitTimeLimitMillis:6048E5},c=b.autoSubmitTimeLimitMillis,d=Date.now();return a.b&&c&&d-a.b<c?!1:Math.random()<b.fraction};ux.prototype.Aa=function(){return"mirror.cast.LogUtils"};ux.prototype.gb=function(){return[void 0,{lastAutoSubmitMillis:this.b}]};ux.prototype.fb=function(){var a=hj(this);this.b=a&&a.lastAutoSubmitMillis||0};var vx=null;fb("mr.mirror.cast.LogUtils");var yx={Yv:"OFFER",Yr:"ANSWER",zw:"PRESENTATION",Pt:"GET_STATUS",Ix:"STATUS_RESPONSE",Ot:"GET_CAPABILITIES",xs:"CAPABILITIES_RESPONSE",kx:"RPC"};var zx=function(){this.capabilities=this.status=this.b=this.error=this.rpc=this.result=this.type=this.f=this.sessionId=null},Cx=function(a){try{if("string"!==typeof a)throw SyntaxError("Cannot parse non-string as JSON");var b;Ax(JSON.parse(a),function(a){b=Bx(a)},function(){throw Error("non-Object result from JSON parse");});return b}catch(d){var c=d instanceof SyntaxError?"JSON parse error: "+d.message:"Type coercion error: "+d.message}"string"==typeof a?a="a string: "+a:a instanceof ArrayBuffer?
(a=new Uint8Array(a),a="an ArrayBuffer whose base64 is "+btoa(String.fromCharCode.apply(null,a))):a="of invalid data type "+typeof a;throw Error(c+". Input was "+a);},Bx=function(a){var b=new zx;null!=a.sessionId&&(b.sessionId=String(a.sessionId));Dx(a.seqNum,function(a){b.f=a},function(){throw Error('"seqNum" must be a number');});if("type"in a){for(var c=String(a.type).toUpperCase(),d=k(Object.keys(yx)),e=d.next();!e.done;e=d.next())if(yx[e.value]==c){b.type=c;break}if(!b.type)throw Error('not a known message "type"');
}"result"in a&&(b.result=String(a.result));if("rpc"in a){if("string"!==typeof a.rpc)throw Error('"rpc" must be a String containing a base64 payload');b.rpc=new Uint8Array([].concat(m(atob(a.rpc))).map(function(a){return a.charCodeAt(0)}))}Ax(a.error,function(a){b.error=Ex(a)},function(){throw Error('"error" must be an Object');});Ax(a.answer,function(a){b.b=Fx(a)},function(){throw Error('"answer" must be an Object');});Ax(a.status,function(a){b.status=Gx(a)},function(){throw Error('"status" must be an Object');
});Ax(a.capabilities,function(a){b.capabilities=Hx(a)},function(){throw Error('"capabilities" must be an Object');});return b},Ax=function(a,b,c){void 0!==a&&(a instanceof Object?b(a):c())},Dx=function(a,b,c){void 0!==a&&("number"!==typeof a?c():b(a))},Ix=function(a,b,c){void 0!==a&&(a instanceof Array&&a.every(function(a){return"number"===typeof a})?b(a):c())},Jx=function(a,b,c){void 0!==a&&(a instanceof Array?b(a.map(function(a){return String(a)})):c())},Kx=function(){this.j=null;this.b=[];this.f=
[];this.g=this.h=this.l=null},Fx=function(a){var b=new Kx;Dx(a.udpPort,function(a){b.j=a},function(){throw Error('"answer.udpPort" must be a number');});Ix(a.sendIndexes,function(a){b.b=a},function(){throw Error('"answer.sendIndexes" must be an array of numbers');});Ix(a.ssrcs,function(a){b.f=a},function(){throw Error('"answer.ssrcs" must be an array of numbers');});"IV"in a&&(b.l=String(a.IV));"receiverGetStatus"in a&&(b.h="true"==String(a.receiverGetStatus).toLowerCase());"castMode"in a&&(b.g=String(a.castMode));
return b},Lx=function(){this.details=this.description=this.code=null},Ex=function(a){var b=new Lx;Dx(a.code,function(a){b.code=a},function(){throw Error('"error.code" must be a number');});"description"in a&&(b.description=String(a.description));Ax(a.details,function(a){b.details=a},function(){throw Error('"error.details" must be an Object');});return b},Mx=function(){this.f=this.b=null},Gx=function(a){var b=new Mx;Dx(a.wifiSnr,function(a){b.b=a},function(){throw Error('"status.wifiSnr" must be a number');
});Ix(a.wifiSpeed,function(a){b.f=a},function(){throw Error('"status.wifiSpeed" must be an array of numbers');});return b},Nx=function(){this.f=this.b=null},Hx=function(a){var b=new Nx;Jx(a.mediaCaps,function(a){b.b=a},function(){throw Error('"capabilities.mediaCaps" must be an array');});if("keySystems"in a){a=a.keySystems;if(!(a instanceof Array))throw Error('"capabilities.keySystems" must be an array');b.f=a.map(function(a){var b;Ax(a,function(a){b=Ox(a)},function(){throw Error('"capabilities.keySystems" entries must be *Objects');
});return b})}return b},Px=function(){this.g=this.o=this.l=this.j=this.u=this.b=this.A=this.f=this.initDataTypes=this.h=null},Ox=function(a){var b=new Px;"keySystemName"in a&&(b.h=String(a.keySystemName));Jx(a.initDataTypes,function(a){b.initDataTypes=a},function(){throw Error('"capabilities.initDataTypes" must be an array');});Jx(a.codecs,function(a){b.f=a},function(){throw Error('"capabilities.codecs" must be an array');});Jx(a.secureCodecs,function(a){b.A=a},function(){throw Error('"capabilities.secureCodecs" must be an array');
});Jx(a.audioRobustness,function(a){b.b=a},function(){throw Error('"capabilities.audioRobustness" must be an array');});Jx(a.videoRobustness,function(a){b.u=a},function(){throw Error('"capabilities.videoRobustness" must be an array');});"persistentLicenseSessionSupport"in a&&(b.j=String(a.persistentLicenseSessionSupport));"persistentReleaseMessageSessionSupport"in a&&(b.l=String(a.persistentReleaseMessageSessionSupport));"persistentStateSupport"in a&&(b.o=String(a.persistentStateSupport));"distinctiveIdentifierSupport"in
a&&(b.g=String(a.distinctiveIdentifierSupport));return b};var Qx=function(a){this.m=fb("mr.mirror.cast.MessageDispatcher");this.h=a;this.b=null;this.f=new Map;this.g=0},Rx=function(a,b,c){if(a.f.has(b))throw Error("Attempt to multiple-subscribe to the same response type: "+b);a.f.set(b,c);a.g=0;mb(a.m,"Added subscriber for "+b+"-type messages.");a.b||(a.b=nw(a.h),a.b.onMessage=a.j.bind(a))},Sx=function(a,b){a.f.delete(b)&&mb(a.m,function(){return"Removed subscriber of "+b+"-type messages."});0==a.f.size&&a.b&&(a.b.Ta(),a.b=null)};
Qx.prototype.sendMessage=function(a){return this.b?"RPC"==a.type?this.b.sendMessage(a,{namespace:"urn:x-cast:com.google.cast.remoting"}):this.b.sendMessage(a,{namespace:"urn:x-cast:com.google.cast.webrtc"}):Promise.reject(Error("Require at least one subscriber before sending messages."))};
var Tx=function(a,b,c,d,e){var f=null,h=function(){Sx(a,c);null!=f&&(clearTimeout(f),f=null)};try{Rx(a,c,function(a){e(a)&&h()})}catch(l){e(null,l);return}f=setTimeout(function(){h();e(null,Error("timeout"))},d);a.sendMessage(b).catch(function(a){h();e(null,a)})};
Qx.prototype.j=function(a){if(a&&"string"===typeof a.namespace_&&a.namespace_.startsWith("urn:x-cast:com.google.cast.")){do{var b=void 0;try{b=Cx(a.data)}catch(d){b=d.message;break}if(b.type){var c=this.f.get(b.type);if(c)try{c(b);return}catch(d){b="Error thrown during delivery. Response was: "+(JSON.stringify(b)+". Error from subscriber callback ")+("was: "+d.message+".")}else b="Message was ignored: "+JSON.stringify(b)}else b="Message did not include response type: "+JSON.stringify(b)}while(0);
10>this.g?this.m.F(b):mb(this.m,b);++this.g}};var Ux=function(){this.b=Promise.resolve(1)},Wx=function(a,b,c){return Vx(a,function(a){return a==b},c)},Xx=function(a,b){var c=[3,4];return Vx(a,function(a){return-1!=c.indexOf(a)},b)},Yx=function(a,b){a.b=a.b.catch(function(){return 1});return Vx(a,function(){return!0},b)},Vx=function(a,b,c){var d,e,f=new Promise(function(a,b){d=a;e=b});a.b=a.b.then(function(a){if(!b(a))return e(Error("Operation requires a different starting checkpoint than "+a)),Promise.resolve(a);var f=new Zx(a);try{var h=c(f)}catch(y){h=
Promise.reject(y)}return h.then(function(a){return d(a)},function(a){return e(a)}).then(function(){if(null===f.b)throw Error("A prior operation that started at "+(a+" did not complete."));return f.b})},function(a){e(a);throw a;});return f},Zx=function(a){this.f=a;this.b=null},$x=function(a,b){a.b="number"===typeof b?b:a.f};var ay=chrome.cast.streaming,cy=function(a,b,c,d,e){this.G=a.sessionId;this.u=a.Kf;this.K=a.Qd;this.g=b;this.N=c;this.D=d;this.M=by(e,"onAnswer",this.u);this.Ca=by(e,"onSessionStop",this.u);this.m=fb("mr.mirror.cast.StreamingLaunchWorkflow");this.B=new Ux;this.o=this.w=this.A=this.f=this.b=this.l=this.j=this.h=null};
cy.prototype.start=function(a,b,c){var d=this;if(!a&&!b)return Promise.reject(Error("No tracks to stream"));var e=a instanceof dy,f=b instanceof dy;(e&&b&&!f||f&&a&&!e)&&Fb("Mixing remoting and non-remoting tracks");return Wx(this.B,1,function(e){d.h=a;d.j=b;d.l=c;d.m.info(function(){return"Launching streaming for "+ey(d)+" "+("to a "+d.K+".")});return fy(d).then(d.C.bind(d)).then(function(a){return gy(d,a).then(function(b){d.M();var c=hy(d,b,a);d.b=iy(d,d.b,c);d.f=iy(d,d.f,c);if(!d.b&&!d.f)throw Error("Receiver did not select any offers from: "+
JSON.stringify(a));d.w=!!b.h;d.o=function(a,b){a==d.b?d.l.Ge("Audio stream (id="+a+") error: "+b):a==d.f&&d.l.Ge("Video stream (id="+a+") error: "+b)};ay.rtpStream.onError.addListener(d.o);return jy(d,b,c)})}).then(function(){d.m.info(function(){return"Launched streaming for "+ey(d)});d.l.dg(d);$x(e,2);return{Fo:d.b,Lr:d.f}})})};
cy.prototype.stop=function(){var a=this;return Yx(this.B,function(b){if(!a.h&&!a.j)return $x(b,1),Promise.resolve();a.m.info(function(){return"Stopping streaming for "+ey(a)+"."});a.o&&(ay.rtpStream.onError.removeListener(a.o),a.o=null);if(a.l){var c=a.l.Rg();a.l=null}else c=Promise.resolve();return c.then(function(){a.b&&(ay.rtpStream.stop(a.b),ay.rtpStream.destroy(a.b),a.b=null);a.f&&(ay.rtpStream.stop(a.f),ay.rtpStream.destroy(a.f),a.f=null);a.A&&(ay.udpTransport.destroy(a.A),a.A=null);a.Ca();
a.m.info(function(){return"Stopped streaming for "+ey(a)+"."});a.h=null;a.j=null;$x(b,1)})})};
var ky=function(a,b){var c=JSON.stringify(b);return Promise.all([a.b&&new Promise(function(b){return ay.rtpStream.getRawEvents(a.b,c,b)}),a.f&&new Promise(function(b){return ay.rtpStream.getRawEvents(a.f,c,b)})]).catch(function(b){a.m.error("Unexpected error when calling getRawEvents()",b);return[]}).then(function(a){return new Blob(a.filter(function(a){return!!a}),{type:"application/gzip"})})},ly=function(a){return Promise.all([a.b&&new Promise(function(b){return ay.rtpStream.getStats(a.b,b)}),a.f&&
new Promise(function(b){return ay.rtpStream.getStats(a.f,b)})]).catch(function(b){a.m.error("Unexpected error when calling getStats()",b);return[]}).then(function(a){return Object.assign.apply(Object,[{}].concat(m(a.filter(function(a){return!!a}))))})},ey=function(a){if(a.h&&a.j)var b="audio+video ";else if(a.h)b="audio-only ";else if(a.j)b="video-only ";else return"stopped";return a.h instanceof dy||a.j instanceof dy?b+"remoting":b+"streaming"},fy=function(a){return new Promise(function(b){var c=
function(c,e,f){c&&!a.h&&(ay.rtpStream.destroy(c),c=null);e&&!a.j&&(ay.rtpStream.destroy(e),e=null);a.m.info(function(){return"Created Cast Streaming session: audioStreamId="+c+", videoStreamId="+e+"."});a.b=c;a.f=e;a.A=f;b()};a.h instanceof dy||a.j instanceof dy?ay.session.create(null,null,c):ay.session.create(a.h,a.j,c)})};
cy.prototype.C=function(){for(var a=eh(),b=eh(),c=[],d=k([this.b,this.f]),e=d.next();!e.done;e=d.next())if(e=e.value)for(var f=e==this.b,h=f?127:96,l=f?Math.floor(499999*Math.random())+1:Math.floor(499999*Math.random())+500001,r=f?48E3:9E4,y=k(ay.rtpStream.getSupportedParams(e)),A=y.next();!A.done;A=y.next())A=A.value,A.payload.payloadType=h,A.payload.maxLatency=this.g.maxLatencyMillis,A.payload.minLatency=this.g.minLatencyMillis,A.payload.animatedLatency=this.g.animatedLatencyMillis,A.payload.ssrc=
l,A.payload.clockRate=r,A.payload.aesKey=a,A.payload.aesIvMask=b,f?(A.payload.channels=2,A.payload.maxBitrate=this.g.audioBitrate,A.payload.maxFrameRate=100):(A.payload.minBitrate=this.g.minVideoBitrate,A.payload.maxBitrate=this.g.maxVideoBitrate,A.payload.maxFrameRate=this.g.maxFrameRate),c.push(new my(e,A));return c};
var iy=function(a,b,c){b&&!c.some(function(a){return a.Nf==b})&&(a.m.F("Destroying RTP stream not selected by the receiver: id="+b),ay.rtpStream.destroy(b),b=null);return b},gy=function(a,b){return new Promise(function(c,d){for(var e=[],f=0;f<b.length;++f){var h=b[f].params,l={index:f,codecName:h.payload.codecName.toLowerCase(),rtpProfile:"cast",rtpPayloadType:h.payload.payloadType,ssrc:h.payload.ssrc,targetDelay:h.payload.animatedLatency,aesKey:h.payload.aesKey,aesIvMask:h.payload.aesIvMask,timeBase:"1/"+
h.payload.clockRate,receiverRtcpEventLog:a.g.enableLogging,rtpExtensions:["adaptive_playout_delay"]};a.g.dscpEnabled&&(l.receiverRtcpDscp=46);127==h.payload.payloadType?Object.assign(l,{type:"audio_source",bitRate:0<h.payload.maxBitrate?1E3*h.payload.maxBitrate:60*h.payload.maxFrameRate+h.payload.clockRate*h.payload.channels,sampleRate:h.payload.clockRate,channels:h.payload.channels}):Object.assign(l,{type:"video_source",renderMode:"video",maxFrameRate:Math.round(1E3*h.payload.maxFrameRate)+"/1000",
maxBitRate:1E3*h.payload.maxBitrate,resolutions:[{width:a.g.maxWidth,height:a.g.maxHeight}]});e.push(l)}var r=a.h instanceof dy||a.j instanceof dy?"remoting":"mirroring",y={type:"OFFER",sessionId:a.G,seqNum:yk(a.N),offer:{castMode:r,receiverGetStatus:!0,supportedStreams:e}};a.m.info(function(){return"Sending OFFER message: "+JSON.stringify(y)});Tx(a.D,y,"ANSWER",1E4,function(b,e){if(null==b)d(e);else if("ok"==b.result&&b.b){if(b.f!=y.seqNum)return a.m.F("Ignoring ANSWER for OFFER with different seqNum: "+
JSON.stringify(b)),!1;((e=b.b.g)&&e!=r||!e&&"mirroring"!=r)&&a.m.error("Expected receiver to ANSWER with castMode="+r+", but got: "+e);mb(a.m,function(){return"Received ANSWER: "+JSON.stringify(b)});c(b.b)}else d(Error("Non-OK ANSWER received: "+JSON.stringify(b)));return!0})})},hy=function(a,b,c){if(b.b.length!=b.f.length)return a.m.error("sendIndexes.length != ssrcs.length in ANSWER: "+JSON.stringify(b)),[];for(var d=[],e={},f=0;f<b.b.length;e={Re:e.Re},++f){var h=b.b[f];if(0>h||h>=c.length)return a.m.error("Receiver selected invalid index ("+
h+" < "+c.length+") in ANSWER: "+JSON.stringify(b)),[];e.Re=c[h];if(d.some(function(a){return function(b){return b.Nf==a.Re.Nf}}(e)))return a.m.error("Receiver selected same RTP stream twice in ANSWER: "+JSON.stringify(b)),[];e.Re.params.payload.feedbackSsrc=b.f[h];if(d.some(function(a){return function(b){return b.params.payload.feedbackSsrc==a.Re.params.payload.feedbackSsrc}}(e)))return a.m.error("Receiver provided same SSRC for two different RTP streams in ANSWER: "+JSON.stringify(b)),[];d.push(e.Re)}return d},
jy=function(a,b,c){var d=null,e=function(){d&&(ay.rtpStream.onStarted.removeListener(d),d=null)};return(new Promise(function(e,h){var f=b.j||2344;a.m.info(function(){return"Starting RTP streams to receiver at "+(a.u+":"+f)+(" for selected offers: "+JSON.stringify(c))});var r=a.A||-1;a.g.dscpEnabled&&(a.m.info("Enabled DSCP in sender."),ay.udpTransport.setOptions(r,{DSCP:!0}));ay.udpTransport.setDestination(r,{address:a.u,port:f});var y=new Set(c.map(function(a){return a.Nf}));d=function(a){y.delete(a);
0==y.size&&e()};ay.rtpStream.onStarted.addListener(d);r=k(c);for(var A=r.next();!A.done;A=r.next())A=A.value,ay.rtpStream.toggleLogging(A.Nf,a.g.enableLogging),ay.rtpStream.start(A.Nf,A.params);setTimeout(function(){h(Error("Timeout: RTP streams failed to start."))},1E4)})).then(e).catch(function(a){e();throw a;})},by=function(a,b,c){var d=this;return a&&b in a?function(){try{a[b](c)}catch(e){d.m.error("Error from testHooks."+b,e)}}:function(){}},my=function(a,b){this.Nf=a;this.params=b},dy=function(){};var py=function(a,b,c,d,e,f){this.o=a;this.D=ny(b,this.o.hb);this.N=new cy(this.o.hb,c,d,e,f);this.w=e;this.j=new Ux;this.g=new oy;this.B=new mojo.Binding(mojo.MirrorServiceRemoter,this,null);this.m=fb("mr.mirror.cast.MediaRemoter");this.u=this.b=this.l=this.h=this.C=null;this.f=!0;this.A=this.G.bind(this)};
py.prototype.Za=function(a,b){var c=this;return Wx(this.j,1,function(d){c.C=a;c.h=b;var e=c.B.createInterfacePtrAndBind();c.B.setConnectionErrorHandler(function(){c.m.info("Remoter mojo pipe connection error.");qy(c)});c.b=new mojo.MirrorServiceRemotingSourcePtr;var f=xg(c.o.mediaSource||"");if(!f)throw Error("Failed to parse tab ID from source:\n          "+c.o.mediaSource);c.m.info("Connecting remoter to browser: tabId="+f);(dg.get("mr.ProviderManager")||null).onMediaRemoterCreated(f,e,mojo.makeRequest(c.b));
c.b.ptr.setConnectionErrorHandler(function(){c.m.info("RemotingSource mojo pipe connection error.");qy(c)});return ry(c).then(function(){if(c.f)c.b.onSinkAvailable(c.D);$x(d,2)})})};
var qy=function(a){return Yx(a.j,function(b){a.b&&(a.b.ptr.reset(),a.b=null);var c=a.l;a.l=null;a.h=null;a.C=null;a.B.close();chrome.settingsPrivate.onPrefsChanged.hasListener(a.A)&&chrome.settingsPrivate.onPrefsChanged.removeListener(a.A);return new Promise(function(d){window.setTimeout(function(){sy(a).then(function(){$x(b,1);d();c&&c()})},250)})})};g=py.prototype;g.nr=function(a){ty(this.g,a)};g.dg=function(a){this.h&&this.h.dg(a)};g.Rg=function(){return this.h?this.h.Rg():Promise.resolve()};
g.Ge=function(a,b){this.m.error("Error during streaming: "+a,b);if(this.b)this.b.onError();qy(this)};
g.start=function(){var a=this,b=!1;this.m.info(function(){b=!0;return"Starting next media remoting session."});b&&uy(this.g,function(b){return a.m.info(b)});vy(this.g);Wx(this.j,2,function(b){return(0,a.C)().then(function(c){a.l=c;Rx(a.w,"RPC",function(b){if(b.rpc){var c=a.g;b=b.rpc;c.l&&(++c.o,c.f+=b.length,c.l(b))}});$x(b,3)}).catch(function(c){return sy(a).then(function(){$x(b);throw c;})})}).then(function(){a.m.info("Remoting started successfully.")}).catch(function(b){a.m.error("Failed to start remoting",b);
a.b.onError()})};g.Er=function(a,b){var c=this;return Wx(this.j,3,function(d){return c.N.start(a?new dy:null,b?new dy:null,c).then(function(a){wy(c.g,function(a){return c.w.sendMessage(a)},function(a){c.b.onMessageFromSink(a)});$x(d,4);return{audio_stream_id:a.Fo||-1,video_stream_id:a.Lr||-1}}).catch(function(a){return sy(c).then(function(){$x(d);throw a;})})}).catch(function(a){c.m.error("Failed to start remoting streams",a);qy(c);return{audio_stream_id:-1,video_stream_id:-1}})};
g.stop=function(a){var b=this;Xx(this.j,function(c){b.b.onStopped(a);return sy(b).then(function(){b.m.info("Remoting stopped.");$x(c,5);(0,b.l)().then(function(){return Wx(b.j,5,function(a){if(b.b&&b.f)b.b.onSinkAvailable(b.D);$x(a,2);return Promise.resolve()})}).catch(function(a){throw a;});b.l=null})}).catch(function(a){b.m.error("Failed to stop remoting: ",a);qy(b)})};
g.Wo=function(){null===this.u&&(this.u=Ae(this.o.hb.Kf).then(function(a){return a.f||!1}));return this.u.then(function(a){return{rate:(a?1E7:5E6)/8}})};
var sy=function(a){return a.N.stop().then(function(){Sx(a.w,"RPC");xy(a.g);yy(a.g)})},ry=function(a){return new Promise(function(b){chrome.settingsPrivate.getPref("media_router.media_remoting.enabled",function(c){chrome.runtime.lastError?a.m.error("Encountered error getting media remoting pref: "+JSON.stringify(chrome.runtime.lastError)):c.type!=chrome.settingsPrivate.PrefType.BOOLEAN?a.m.error("Pref value not a boolean: "+JSON.stringify(c)):(a.f=!!c.value,a.m.info("Initializing mediaRemotingEnabled_ with value read from pref: "+
a.f));chrome.settingsPrivate.onPrefsChanged.hasListener(a.A)||chrome.settingsPrivate.onPrefsChanged.addListener(a.A);b()})})};
py.prototype.G=function(a){if(this.b){a=k(a);for(var b=a.next();!b.done;b=a.next())if(b=b.value,"media_router.media_remoting.enabled"==b.key){if(b.type!=chrome.settingsPrivate.PrefType.BOOLEAN){this.m.error("Pref value not a boolean: "+JSON.stringify(b));break}a=!!b.value;if(this.f==a)break;this.f=a;this.m.info("mediaRemotingEnabled_ changed to: "+this.f);if(this.f)this.b.onSinkAvailable(this.D);else this.b.onStopped(mojo.RemotingStopReason.USER_DISABLED);break}}};
var ny=function(a,b){var c=this,d=new mojo.RemotingSinkMetadata;d.features=[];d.friendly_name=b.Dr||"";d.audio_capabilities=[];d.video_capabilities=[];var e=mojo.RemotingSinkAudioCapability,f=mojo.RemotingSinkVideoCapability,h=d.audio_capabilities,l=d.video_capabilities,r=b.Qd||"";(a.b||[]).forEach(function(a){switch(a){case "audio":h.push(e.CODEC_BASELINE_SET);break;case "aac":h.push(e.CODEC_AAC);break;case "opus":h.push(e.CODEC_OPUS);break;case "video":l.push(f.CODEC_BASELINE_SET);break;case "4k":l.push(f.SUPPORT_4K);
break;case "h264":l.push(f.CODEC_H264);break;case "vp8":l.push(f.CODEC_VP8);break;case "vp9":r.startsWith("Chromecast Ultra")&&l.push(f.CODEC_VP9);break;case "hevc":r.startsWith("Chromecast Ultra")&&l.push(f.CODEC_HEVC);break;default:c.m.info("Unknown mediaCap name: "+a)}});b.Qd&&"Chromecast Ultra"==b.Qd&&l.push(f.SUPPORT_4K);return d};py.prototype.estimateTransmissionCapacity=py.prototype.Wo;py.prototype.stop=py.prototype.stop;py.prototype.startDataStreams=py.prototype.Er;py.prototype.start=py.prototype.start;
py.prototype.sendMessageToSink=py.prototype.nr;
var oy=function(){this.l=this.j=this.b=null;this.u=this.f=this.o=this.g=this.A=0;this.h=null},vy=function(a){a.b=[];zy(a,performance.now())},wy=function(a,b,c){a.j=b;a.l=c;a.b?(b=a.b,a.b=null,b.forEach(function(b){return ty(a,b.data).then(b.qr,b.im)})):zy(a,performance.now())},xy=function(a){if(a.b){var b=Error("Stop before delivering pending message");a.b.forEach(function(a){return a.im(b)});a.b=null}a.j=null;a.l=null},ty=function(a,b){if(a.j){var c=btoa(String.fromCharCode.apply(null,b));++a.A;
a.g+=b.length;return a.j({type:"RPC",rpc:c})}return a.b?new Promise(function(c,e){a.b.push({data:b,qr:c,im:e})}):Promise.reject(Error("RPC pipe not started"))},uy=function(a,b){yy(a);a.h=setInterval(function(){if(a.b)var c=a.b.length+" messages are waiting to send.";else{c=performance.now();var d=(c-a.u)/1E3;d="Over the past "+d.toFixed(1)+" seconds, sent "+(a.A+" messages ("+Math.round(a.g/d)+" bytes/sec) and ")+("received "+a.o+" messages ("+Math.round(a.f/d)+" ")+"bytes/sec).";zy(a,c);c=d}b(c)},
3E4)},yy=function(a){null!=a.h&&(clearInterval(a.h),a.h=null)},zy=function(a,b){a.A=0;a.g=0;a.o=0;a.f=0;a.u=b};var Ay=function(a){return a&&a.getAudioTracks()&&0<a.getAudioTracks().length?a.getAudioTracks()[0]:null},By=function(a){return a&&a.getVideoTracks()&&0<a.getVideoTracks().length?a.getVideoTracks()[0]:null};var Cy=function(a,b,c,d,e){this.g=new cy(a,b,c,d,void 0===e?null:e);this.m=fb("mr.mirror.cast.MediaStreamer");this.j=new Ux;this.h=this.f=this.b=this.l=null};Cy.prototype.start=function(a,b){var c=this;return Wx(this.j,1,function(d){c.l=a;c.b=Ay(a);c.b&&"ended"==c.b.readyState&&(c.b=null);c.f=By(a);c.f&&"ended"==c.f.readyState&&(c.f=null);if(!c.b&&!c.f)return $x(d),Promise.reject(Error("No MediaStream tracks to stream."));c.h=b;return c.g.start(c.b,c.f,c.h).then(function(){return $x(d,2)})})};
Cy.prototype.stop=function(){var a=this;return Yx(this.j,function(b){return a.g.stop().then(function(){a.b=null;a.f=null;a.l=null;a.h=null;$x(b,1)})})};var Dy=function(a){return Wx(a.j,2,function(b){a.m.info("Suspending media streaming...");return a.g.stop().then(function(){a.m.info("Suspended media streaming.");$x(b,3)})})};
Cy.prototype.resume=function(){var a=this;return Wx(this.j,3,function(b){a.b&&"ended"==a.b.readyState&&(a.b=null);a.f&&"ended"==a.f.readyState&&(a.f=null);if(!a.b&&!a.f)return Promise.reject(Error("Cannot resume: All tracks have ended."));a.m.info("Resuming media streaming...");return a.g.start(a.b,a.f,a.h).then(function(){a.m.info("Resumed media streaming.");$x(b,2)})})};var Ey=function(a,b,c){this.j=a;this.h=b;this.g=c;this.m=fb("mr.mirror.cast.WifiStatusMonitor");this.b=null;this.f=[]};Ey.prototype.start=function(){var a=this;null==this.b&&(mb(this.m,"Starting Wifi Status Monitoring."),this.f=[],Rx(this.g,"STATUS_RESPONSE",function(b){return Fy(a,b)}),this.b=setInterval(function(){return Gy(a)},12E4),Gy(this))};Ey.prototype.stop=function(){null!=this.b&&(mb(this.m,"Stopping Wifi Status Monitoring."),clearInterval(this.b),this.b=null,Sx(this.g,"STATUS_RESPONSE"))};
var Fy=function(a,b){if(null!=a.b)if(b.status){var c={};null!=b.status.b&&(c.wifiSnr=b.status.b);null!=b.status.f&&(c.wifiSpeed=b.status.f[3]);0==Object.keys(c).length?a.m.F(function(){return"No status fields populated in response: "+JSON.stringify(b)}):(c.timestamp=Date.now(),30==a.f.length&&a.f.shift(),a.f.push(c),a.m.info(function(){return"Current Wifi status: "+JSON.stringify(c)}))}else a.m.F(function(){return"Ignoring response without status: "+JSON.stringify(b)})},Gy=function(a){a.g.sendMessage({type:"GET_STATUS",
sessionId:a.j,seqNum:yk(a.h),get_status:["wifiSnr","wifiSpeed"]})};var Hy=function(a,b,c,d){this.D=b.Kf;this.o={extVersion:chrome.runtime.getManifest().version,extChannel:"public",mirrorSettings:Mg(a),sender:navigator.userAgent||"UNKNOWN",receiverProductName:b.Qd};this.C=c;this.w=d;this.h=this.f=this.A=this.l=this.j=this.u=this.g=null;this.b=[]};Hy.prototype.dg=function(a){null!=this.f&&clearInterval(this.f);this.g=a;this.u=Date.now();this.f=setInterval(this.B.bind(this,a),9E5)};
Hy.prototype.Rg=function(){null!=this.f&&(clearInterval(this.f),this.f=null);if(null!=this.g){var a=this.B(this.g);this.g=null;return a}return Promise.resolve()};Hy.prototype.Ge=function(a,b){null==this.j&&(this.j=Date.now(),"function"===typeof a?this.l=a():"string"===typeof a&&(this.l=a),b&&"string"===typeof b.stack&&(this.A=b.stack))};
var Jy=function(a,b){return(null==a.g?Promise.resolve():a.B(a.g)).then(function(){var c=b.map(function(b){b=Iy(a,b);var c=b.map(function(a){return a.events}).filter(function(a){return null!=a}),d=["["];b.map(function(a){return a.Mf}).forEach(function(a,b){0<b&&d.push(",");d.push(a)});d.push("]");return{events:new Blob(c,{type:"application/gzip"}),Mf:new Blob(d,{type:"application/json"})}});a.b=[];return c})};
Hy.prototype.B=function(a){var b=this;if(null!=this.h)return this.h;var c=Ae(this.D).then(function(c){c={receiverVersion:c.b,receiverConnected:c.h,receiverOnEthernet:c.f,receiverHasUpdatePending:c.g,receiverUptimeSeconds:c.j};Object.assign(c,b.o);var d=Date.now();Object.assign(c,{startTime:b.u,endTime:d,activity:ey(a),receiverWifiStatus:Array.from(b.w.f)});b.u=d;null!=b.j&&(Object.assign(c,{streamingErrorTime:b.j,streamingErrorMessage:b.l,streamingErrorCause:b.A}),b.j=null,b.l=null,b.A=null);return c});
return(this.h=Promise.all([c.then(function(b){return ky(a,b)}),c,ly(a)]).then(function(a){var c=k(a);a=c.next().value;var d=c.next().value;c=c.next().value;b.b.push({events:a,Mf:new Blob([JSON.stringify(Object.assign({tags:d},c))],{type:"application/json"})});b.b=Iy(b,b.C);b.h=null}))||Promise.resolve()};
var Iy=function(a,b){b-=2;for(var c=[],d=a.b.length-1;0<=d;--d){b-=a.b[d].Mf.size+1;if(0>b)break;c.push({events:null,Mf:a.b[d].Mf});if(null!=a.b[d].events){var e=a.b[d].events.size;b>=e&&(c[c.length-1].events=a.b[d].events,b-=e)}}return c.reverse()};var Ky=fb("mr.NetworkUtils"),Ly=function(a,b){return Pf?new Promise(function(c,d){chrome.networkingPrivate.setWifiTDLSEnabledState(a,b,function(a){chrome.runtime.lastError?(Ky.F("Unable to set TDLS state: state = "+b+", error = "+chrome.runtime.lastError.message),d("Unable to set TDLS state to "+b+".")):(Ky.info("TDLS state changed: state = "+b+", status = "+a),c(a))})}):Promise.reject("TDLS feature not enabled.")};var My=function(a,b,c,d){d=void 0===d?null:d;Jg.call(this,b);var e=b.hb;this.B=e.sessionId;this.G=e.Kf;this.N=a;this.K=d;this.m=fb("mr.mirror.cast.Session");this.u=new Ux;this.A=new xk("mirror.cast.SeqNumGenerator");this.o=new Qx(b.id);this.l=new Cy(e,this.N,this.A,this.o,this.K);this.h=null;this.b=new Hy(a,e,c,new Ey(this.B,this.A,this.o));this.g=!1;this.w=null};n(My,Jg);g=My.prototype;
g.start=function(a){var b=this;return Wx(this.u,1,function(c){var d=new qb("MediaRouter.CastStreaming.Session.Launch");return Ny(b).then(function(c){b.g=c;return b.l.start(a,b)}).then(function(){if(b.l.g.w){var a=b.b;a.o.tdlsIsOn=b.g;a.w.start();Oy(b)}else b.b.o.tdlsIsOn=b.g;d.b();b.w=new wb("MediaRouter.CastStreaming.Session.Length");$x(c,2);return b})})};
g.stop=function(){var a=this;return Yx(this.u,function(b){a.w&&(a.w.b(),a.w=null);a.b.w.stop();return a.l.stop().then(function(){return a.h?qy(a.h):Promise.resolve()}).then(function(){a.h=null;return a.g?Py(a):Promise.resolve()}).then(function(){a.g=!1;$x(b,4)})})};g.gm=function(){var a={sessionId:this.B,seqNum:yk(this.A),type:"PRESENTATION",icons:[],title:Hg(this.bc)};this.m.info("Sending session metadata update to receiver: "+this.B);this.o.sendMessage(a)};g.dg=function(a){this.b.dg(a)};g.Rg=function(){return this.b.Rg()};
g.Ge=function(a,b){this.b.Ge(a,b);this.m.error(a,b);this.stop()};
var Qy=function(a,b){return Jy(a.b,b)},Ny=function(a){return a.N.useTdls?Ly(a.G,!0).then(function(b){if("Connected"==b)return a.m.info("Successfully enabled TDLS."),!0;a.m.F("Did not enable TDLS: result="+b);return!1}).catch(function(b){a.m.F("Error while calling enableTDLS()",b);return!1}):Promise.resolve(!1)},Py=function(a){return Ly(a.G,!1).catch(function(b){return a.m.error("Error while turning TDLS back off",b)})},Oy=function(a){Ry(a).then(function(b){(b.b||[]).includes("video")?Sy(a,b):a.m.F(function(){return"Receiver incapable of Media Remoting: "+
JSON.stringify(b)})}).catch(function(b){a.m.F("None/Invalid capabilites response. Media Remoting disabled.",b)})},Ry=function(a){return new Promise(function(b,c){var d={type:"GET_CAPABILITIES",sessionId:a.B,seqNum:yk(a.A)};a.m.info(function(){return"Sending GET_CAPABILITIES message: "+JSON.stringify(d)});Tx(a.o,d,"CAPABILITIES_RESPONSE",3E4,function(e,f){if(null==e)return c(f),!0;if("ok"!=e.result||!e.capabilities)return c(Error("Bad response: "+JSON.stringify(e))),!0;if(e.f!=d.seqNum)return a.m.info(function(){return"Ignoring CAPABILITIES_RESPONSE with different seqNum: "+
JSON.stringify(e)}),!1;mb(a.m,function(){return"Received CAPABILITIES_RESPONSE: "+JSON.stringify(e)});b(e.capabilities);return!0})})},Sy=function(a,b){Wx(a.u,2,function(c){var d=a.f.hb.Qd||"<UNKNOWN>";if(!d.startsWith("Chromecast")&&!d.startsWith("Eureka Dongle"))return a.m.F("HACK: Media Remoting disabled because the receiver model--"+('"'+d+'" according to discovery--is not a Chromecast.')),$x(c),Promise.resolve();a.h=new py(a.f,b,a.N,a.A,a.o,a.K);return a.h.Za(a.M.bind(a),a).catch(function(b){a.m.error("Media Remoting start failed: "+
b.message,b)}).then(function(){return $x(c)})})};My.prototype.M=function(){var a=this;return Wx(this.u,2,function(b){return new Promise(function(c,d){Dy(a.l).then(function(){$x(b,3);a.D=!0;Dg(a);c(a.Ca.bind(a))}).catch(function(b){a.Ge("Failed to suspend MediaStreamer before starting remoting",b);d(b)})})})};
My.prototype.Ca=function(){var a=this;return Wx(this.u,3,function(b){return new Promise(function(c,d){a.l.resume().then(function(){$x(b,2);a.D=!1;Dg(a);c()}).catch(function(b){a.Ge("Failed resume MediaStreamer after ending remoting mode",b);d(b)})})})};var Ty=function(){yg.call(this,"cast_streaming");this.j=this.A=this.D=this.C=this.h=null;this.G=this.N="";this.K=this.o=!1;this.Ca=this.da.bind(this);this.B=null};n(Ty,yg);g=Ty.prototype;g.eg=function(a){this.o=a||!1;this.K=!0};g.getName=function(){return"cast_streaming"};
g.dj=function(a,b,c,d,e){var f=this;if(!this.o)return yg.prototype.dj.call(this,a,b,c,d,e);this.L.info("Start mirroring on route "+a.id);if(!this.K)return If(Error("Not initialized"));var h=new Promise(function(h,r){f.l().then(function(){if(tg(b)&&c.shouldCaptureVideo)return(new Promise(function(b){chrome.tabs.get(a.hb.tabId||-1,b)})).then(function(a){return ag(a).then(function(a){f.G=a})})}).then(function(){return e?e(a).b:a}).then(function(a){f.C=new mojo.Binding(mojo.MirroringSessionObserver,f,
null);f.D=new mojo.Binding(mojo.MirroringCastMessageChannel,f,null);f.j=nw(a.id);f.j.onMessage=f.Zp.bind(f);var e=f.C.createInterfacePtrAndBind(),l=f.D.createInterfacePtrAndBind(),r=Uy(a,c);f.h=new mojo.MirroringServiceHostPtr;var y=a.hb.tabId||-1;rg(b)?f.g.getMirroringServiceHostForTab(y,mojo.makeRequest(f.h)):tg(b)?f.g.getMirroringServiceHostForDesktop(y,f.G,mojo.makeRequest(f.h)):vg(b)?(y=new mojo.Url,y.url=b,f.g.getMirroringServiceHostForOffscreenTab(y,d||"",mojo.makeRequest(f.h))):f.h=null;if(!f.h)throw new Mf("Error to get mirroring service host");
f.A=new mojo.MirroringCastMessageChannelPtr;f.h.start(r,e,l,mojo.makeRequest(f.A));f.B=new Jg(a);e=f.g.Ei.bind(f.g);f.B.C=e;rg(b)&&!chrome.tabs.onUpdated.hasListener(f.Ca)&&chrome.tabs.onUpdated.addListener(f.Ca);(rg(b)||vg(b))&&Cg(f.B,a.hb.tabId);h(a)}).catch(function(a){f.L.info("Mirroring launch error: "+a);r(a)})});return Jf(h)};g.ih=function(a,b){return new My(a,b,20969472,null)};g.Jg=function(){qx(0)};g.Gg=function(){qx(1)};g.Kh=function(){qx(2)};g.Hg=function(){zb("MediaRouter.CastStreaming.Session.End")};
g.Jh=function(a){Ab("MediaRouter.CastStreaming.Start.Failure",a,Lf)};g.Ig=function(){zb("MediaRouter.CastStreaming.Stream.End")};
g.ki=function(a){var b=this;return this.o?Promise.resolve():(new Promise(function(a){return chrome.metricsPrivate.getIsCrashReportingEnabled(a)})).then(function(c){var d=c&&xx(),e=[9351424];d&&e.push(20969472);return Qy(a,e).then(function(a){var e=a[a.length-1];a=sj(a[0].events).catch(function(a){b.L.error("Failed to persist events Blob.",a)});d&&0<e.events.size?tx(e.events,void 0,b.Yp.bind(b)):c&&sx("stats.json",e.Mf,void 0,void 0);return a})})};g.Yp=function(a){a&&(wx().b=Date.now())};
g.cj=function(a){if(this.o)return cb();this.L.info("Received message to upload logs for "+a);return this.b?Qy(this.b,[20969472]).then(function(b){b=k(b).next().value;return 0==b.events.size?"":tx(b.events,a)}):Promise.resolve(Vy(this,a))};
var Vy=function(a,b){var c=window.localStorage.getItem("mr.temp.mirror.cast.Service.eventsBlob");if(null==c||1>c.length)c=null;else{for(var d=new Uint16Array(c.length),e=0;e<c.length;++e)d[e]=c.charCodeAt(e);c=d.buffer;d=(new Uint8Array(c,c.byteLength-1,1))[0];c=new Uint8Array(c,0,c.byteLength-(0==d?2:1));c=new Blob([c],{type:"application/gzip"})}if(null!=c&&0!=c.size)return sj(new Blob),a.L.info("Uploading saved logs for feedback."),tx(c,b)};g=Ty.prototype;
g.onError=function(a){this.L.info("Mirroring service error: "+a);this.l()};g.didStart=function(){rg(this.N)?this.Jg():tg(this.N)?this.Gg():vg(this.N)&&this.Kh()};g.didStop=function(){this.l()};g.send=function(a){if(this.j){var b=JSON.parse(a.jsonFormatData);mb(this.L,function(){return"Sending message: "+JSON.stringify(b)});this.j.sendMessage(a.jsonFormatData,{namespace:a.messageNamespace})}};
g.Zp=function(a){if(a&&(a.namespace_===mojo.MirroringWebRtcNamespace||a.namespace_===mojo.MirroringRemotingNamespace)&&this.A){var b=new mojo.MirroringCastMessage;b.messageNamespace=a.namespace_;"string"!==typeof a.data?this.L.info("Received non-string as JSON"):(b.jsonFormatData=a.data,this.A.send(b))}};
var Uy=function(a,b){var c=new mojo.MirroringSessionParameters;c.receiverAddress=new mojo.IPAddress;c.receiverAddress.addressBytes=a.hb.Kf.split(".").map(function(a){return parseInt(a,10)});c.receiverModelName=a.hb.Qd;c.type=b.shouldCaptureVideo&&b.shouldCaptureAudio?mojo.MirroringSessionType.AUDIO_AND_VIDEO:b.shouldCaptureVideo?mojo.MirroringSessionType.VIDEO_ONLY:mojo.MirroringSessionType.AUDIO_ONLY;return c};Ty.prototype.da=function(a,b,c){qg(14);this.B&&Eg(this.B,a,b,c)};
Ty.prototype.l=function(){chrome.tabs.onUpdated.removeListener(this.Ca);return this.o?this.K?this.h?(this.h.ptr.reset(),this.A=this.h=null,this.j&&this.j.Ta(),this.j=null,this.C&&(this.C.close(),this.C=null),this.D&&(this.D.close(),this.D=null),this.G=this.N="",this.Hg(),Promise.resolve(!0)):Promise.resolve(!1):Promise.reject("Not initialized"):yg.prototype.l.call(this)};
Ty.prototype.ej=function(a,b,c,d,e,f){return this.o?If(Error("Mirroring service does not support updating stream")):yg.prototype.ej.call(this,a,b,c,d,e,f)};Ty.prototype.send=Ty.prototype.send;Ty.prototype.didStop=Ty.prototype.didStop;Ty.prototype.didStart=Ty.prototype.didStart;Ty.prototype.onError=Ty.prototype.onError;var Wy=new Ty;mg("mr.mirror.cast.Service",Wy);
