(this.webpackJsonpanother_dumb_zombie_game=this.webpackJsonpanother_dumb_zombie_game||[]).push([["orbit-controls"],{"./node_modules/three/examples/jsm/controls/OrbitControls.js":function(e,t,n){"use strict";n.r(t),n.d(t,"OrbitControls",(function(){return a})),n.d(t,"MapControls",(function(){return i}));var o=n("./node_modules/three/build/three.module.js"),a=function(e,t){var n,a,i,c,s,r;document,this.object=e,this.domElement=t,this.enabled=!0,this.target=new o.pb,this.minDistance=0,this.maxDistance=Infinity,this.minZoom=0,this.maxZoom=Infinity,this.minPolarAngle=0,this.maxPolarAngle=Math.PI,this.minAzimuthAngle=-Infinity,this.maxAzimuthAngle=Infinity,this.enableDamping=!1,this.dampingFactor=.05,this.enableZoom=!0,this.zoomSpeed=1,this.enableRotate=!0,this.rotateSpeed=1,this.enablePan=!0,this.panSpeed=1,this.screenSpacePanning=!0,this.keyPanSpeed=7,this.autoRotate=!1,this.autoRotateSpeed=2,this.enableKeys=!0,this.keys={LEFT:37,UP:38,RIGHT:39,BOTTOM:40},this.mouseButtons={LEFT:o.F.ROTATE,MIDDLE:o.F.DOLLY,RIGHT:o.F.PAN},this.touches={ONE:o.jb.ROTATE,TWO:o.jb.DOLLY_PAN},this.target0=this.target.clone(),this.position0=this.object.position.clone(),this.zoom0=this.object.zoom,this.getPolarAngle=function(){return f.phi},this.getAzimuthalAngle=function(){return f.theta},this.saveState=function(){u.target0.copy(u.target),u.position0.copy(u.object.position),u.zoom0=u.object.zoom},this.reset=function(){u.target.copy(u.target0),u.object.position.copy(u.position0),u.object.zoom=u.zoom0,u.object.updateProjectionMatrix(),u.dispatchEvent(m),u.update(),b=l.NONE},this.update=(n=new o.pb,a=(new o.Z).setFromUnitVectors(e.up,new o.pb(0,1,0)),i=a.clone().inverse(),c=new o.pb,s=new o.Z,r=2*Math.PI,function(){var e=u.object.position;n.copy(e).sub(u.target),n.applyQuaternion(a),f.setFromVector3(n),u.autoRotate&&b===l.NONE&&Y(2*Math.PI/60/60*u.autoRotateSpeed),u.enableDamping?(f.theta+=E.theta*u.dampingFactor,f.phi+=E.phi*u.dampingFactor):(f.theta+=E.theta,f.phi+=E.phi);var t=u.minAzimuthAngle,o=u.maxAzimuthAngle;return isFinite(t)&&isFinite(o)&&(t<-Math.PI?t+=r:t>Math.PI&&(t-=r),o<-Math.PI?o+=r:o>Math.PI&&(o-=r),f.theta=t<o?Math.max(t,Math.min(o,f.theta)):f.theta>(t+o)/2?Math.max(t,f.theta):Math.min(o,f.theta)),f.phi=Math.max(u.minPolarAngle,Math.min(u.maxPolarAngle,f.phi)),f.makeSafe(),f.radius*=g,f.radius=Math.max(u.minDistance,Math.min(u.maxDistance,f.radius)),!0===u.enableDamping?u.target.addScaledVector(v,u.dampingFactor):u.target.add(v),n.setFromSpherical(f),n.applyQuaternion(i),e.copy(u.target).add(n),u.object.lookAt(u.target),!0===u.enableDamping?(E.theta*=1-u.dampingFactor,E.phi*=1-u.dampingFactor,v.multiplyScalar(1-u.dampingFactor)):(E.set(0,0,0),v.set(0,0,0)),g=1,!!(O||c.distanceToSquared(u.object.position)>d||8*(1-s.dot(u.object.quaternion))>d)&&(u.dispatchEvent(m),c.copy(u.object.position),s.copy(u.object.quaternion),O=!1,!0)}),this.dispose=function(){u.domElement.removeEventListener("contextmenu",te,!1),u.domElement.removeEventListener("pointerdown",K,!1),u.domElement.removeEventListener("wheel",W,!1),u.domElement.removeEventListener("touchstart",Q,!1),u.domElement.removeEventListener("touchend",ee,!1),u.domElement.removeEventListener("touchmove",$,!1),u.domElement.ownerDocument.removeEventListener("pointermove",q,!1),u.domElement.ownerDocument.removeEventListener("pointerup",G,!1),u.domElement.removeEventListener("keydown",J,!1)};var u=this,m={type:"change"},h={type:"start"},p={type:"end"},l={NONE:-1,ROTATE:0,DOLLY:1,PAN:2,TOUCH_ROTATE:3,TOUCH_PAN:4,TOUCH_DOLLY_PAN:5,TOUCH_DOLLY_ROTATE:6},b=l.NONE,d=1e-6,f=new o.hb,E=new o.hb,g=1,v=new o.pb,O=!1,y=new o.ob,T=new o.ob,P=new o.ob,L=new o.ob,j=new o.ob,A=new o.ob,w=new o.ob,N=new o.ob,D=new o.ob;function M(){return Math.pow(.95,u.zoomSpeed)}function Y(e){E.theta-=e}function k(e){E.phi-=e}var R,x=(R=new o.pb,function(e,t){R.setFromMatrixColumn(t,0),R.multiplyScalar(-e),v.add(R)}),S=function(){var e=new o.pb;return function(t,n){!0===u.screenSpacePanning?e.setFromMatrixColumn(n,1):(e.setFromMatrixColumn(n,0),e.crossVectors(u.object.up,e)),e.multiplyScalar(t),v.add(e)}}(),_=function(){var e=new o.pb;return function(t,n){var o=u.domElement;if(u.object.isPerspectiveCamera){var a=u.object.position;e.copy(a).sub(u.target);var i=e.length();i*=Math.tan(u.object.fov/2*Math.PI/180),x(2*t*i/o.clientHeight,u.object.matrix),S(2*n*i/o.clientHeight,u.object.matrix)}else u.object.isOrthographicCamera?(x(t*(u.object.right-u.object.left)/u.object.zoom/o.clientWidth,u.object.matrix),S(n*(u.object.top-u.object.bottom)/u.object.zoom/o.clientHeight,u.object.matrix)):u.enablePan=!1}}();function F(e){u.object.isPerspectiveCamera?g/=e:u.object.isOrthographicCamera?(u.object.zoom=Math.max(u.minZoom,Math.min(u.maxZoom,u.object.zoom*e)),u.object.updateProjectionMatrix(),O=!0):u.enableZoom=!1}function C(e){u.object.isPerspectiveCamera?g*=e:u.object.isOrthographicCamera?(u.object.zoom=Math.max(u.minZoom,Math.min(u.maxZoom,u.object.zoom/e)),u.object.updateProjectionMatrix(),O=!0):u.enableZoom=!1}function I(e){y.set(e.clientX,e.clientY)}function H(e){L.set(e.clientX,e.clientY)}function z(e){if(1==e.touches.length)y.set(e.touches[0].pageX,e.touches[0].pageY);else{var t=.5*(e.touches[0].pageX+e.touches[1].pageX),n=.5*(e.touches[0].pageY+e.touches[1].pageY);y.set(t,n)}}function X(e){if(1==e.touches.length)L.set(e.touches[0].pageX,e.touches[0].pageY);else{var t=.5*(e.touches[0].pageX+e.touches[1].pageX),n=.5*(e.touches[0].pageY+e.touches[1].pageY);L.set(t,n)}}function Z(e){var t=e.touches[0].pageX-e.touches[1].pageX,n=e.touches[0].pageY-e.touches[1].pageY,o=Math.sqrt(t*t+n*n);w.set(0,o)}function U(e){if(1==e.touches.length)T.set(e.touches[0].pageX,e.touches[0].pageY);else{var t=.5*(e.touches[0].pageX+e.touches[1].pageX),n=.5*(e.touches[0].pageY+e.touches[1].pageY);T.set(t,n)}P.subVectors(T,y).multiplyScalar(u.rotateSpeed);var o=u.domElement;Y(2*Math.PI*P.x/o.clientHeight),k(2*Math.PI*P.y/o.clientHeight),y.copy(T)}function V(e){if(1==e.touches.length)j.set(e.touches[0].pageX,e.touches[0].pageY);else{var t=.5*(e.touches[0].pageX+e.touches[1].pageX),n=.5*(e.touches[0].pageY+e.touches[1].pageY);j.set(t,n)}A.subVectors(j,L).multiplyScalar(u.panSpeed),_(A.x,A.y),L.copy(j)}function B(e){var t=e.touches[0].pageX-e.touches[1].pageX,n=e.touches[0].pageY-e.touches[1].pageY,o=Math.sqrt(t*t+n*n);N.set(0,o),D.set(0,Math.pow(N.y/w.y,u.zoomSpeed)),F(D.y),w.copy(N)}function K(e){if(!1!==u.enabled)switch(e.pointerType){case"mouse":!function(e){var t;switch(e.preventDefault(),u.domElement.focus?u.domElement.focus():window.focus(),e.button){case 0:t=u.mouseButtons.LEFT;break;case 1:t=u.mouseButtons.MIDDLE;break;case 2:t=u.mouseButtons.RIGHT;break;default:t=-1}switch(t){case o.F.DOLLY:if(!1===u.enableZoom)return;!function(e){w.set(e.clientX,e.clientY)}(e),b=l.DOLLY;break;case o.F.ROTATE:if(e.ctrlKey||e.metaKey||e.shiftKey){if(!1===u.enablePan)return;H(e),b=l.PAN}else{if(!1===u.enableRotate)return;I(e),b=l.ROTATE}break;case o.F.PAN:if(e.ctrlKey||e.metaKey||e.shiftKey){if(!1===u.enableRotate)return;I(e),b=l.ROTATE}else{if(!1===u.enablePan)return;H(e),b=l.PAN}break;default:b=l.NONE}b!==l.NONE&&(u.domElement.ownerDocument.addEventListener("pointermove",q,!1),u.domElement.ownerDocument.addEventListener("pointerup",G,!1),u.dispatchEvent(h))}(e)}}function q(e){if(!1!==u.enabled)switch(e.pointerType){case"mouse":!function(e){if(!1===u.enabled)return;switch(e.preventDefault(),b){case l.ROTATE:if(!1===u.enableRotate)return;!function(e){T.set(e.clientX,e.clientY),P.subVectors(T,y).multiplyScalar(u.rotateSpeed);var t=u.domElement;Y(2*Math.PI*P.x/t.clientHeight),k(2*Math.PI*P.y/t.clientHeight),y.copy(T),u.update()}(e);break;case l.DOLLY:if(!1===u.enableZoom)return;!function(e){N.set(e.clientX,e.clientY),D.subVectors(N,w),D.y>0?F(M()):D.y<0&&C(M()),w.copy(N),u.update()}(e);break;case l.PAN:if(!1===u.enablePan)return;!function(e){j.set(e.clientX,e.clientY),A.subVectors(j,L).multiplyScalar(u.panSpeed),_(A.x,A.y),L.copy(j),u.update()}(e)}}(e)}}function G(e){if(!1!==u.enabled)switch(e.pointerType){case"mouse":!function(e){if(!1===u.enabled)return;u.domElement.ownerDocument.removeEventListener("pointermove",q,!1),u.domElement.ownerDocument.removeEventListener("pointerup",G,!1),u.dispatchEvent(p),b=l.NONE}()}}function W(e){!1===u.enabled||!1===u.enableZoom||b!==l.NONE&&b!==l.ROTATE||(e.preventDefault(),e.stopPropagation(),u.dispatchEvent(h),function(e){e.deltaY<0?C(M()):e.deltaY>0&&F(M()),u.update()}(e),u.dispatchEvent(p))}function J(e){!1!==u.enabled&&!1!==u.enableKeys&&!1!==u.enablePan&&function(e){var t=!1;switch(e.keyCode){case u.keys.UP:_(0,u.keyPanSpeed),t=!0;break;case u.keys.BOTTOM:_(0,-u.keyPanSpeed),t=!0;break;case u.keys.LEFT:_(u.keyPanSpeed,0),t=!0;break;case u.keys.RIGHT:_(-u.keyPanSpeed,0),t=!0}t&&(e.preventDefault(),u.update())}(e)}function Q(e){if(!1!==u.enabled){switch(e.preventDefault(),e.touches.length){case 1:switch(u.touches.ONE){case o.jb.ROTATE:if(!1===u.enableRotate)return;z(e),b=l.TOUCH_ROTATE;break;case o.jb.PAN:if(!1===u.enablePan)return;X(e),b=l.TOUCH_PAN;break;default:b=l.NONE}break;case 2:switch(u.touches.TWO){case o.jb.DOLLY_PAN:if(!1===u.enableZoom&&!1===u.enablePan)return;!function(e){u.enableZoom&&Z(e),u.enablePan&&X(e)}(e),b=l.TOUCH_DOLLY_PAN;break;case o.jb.DOLLY_ROTATE:if(!1===u.enableZoom&&!1===u.enableRotate)return;!function(e){u.enableZoom&&Z(e),u.enableRotate&&z(e)}(e),b=l.TOUCH_DOLLY_ROTATE;break;default:b=l.NONE}break;default:b=l.NONE}b!==l.NONE&&u.dispatchEvent(h)}}function $(e){if(!1!==u.enabled)switch(e.preventDefault(),e.stopPropagation(),b){case l.TOUCH_ROTATE:if(!1===u.enableRotate)return;U(e),u.update();break;case l.TOUCH_PAN:if(!1===u.enablePan)return;V(e),u.update();break;case l.TOUCH_DOLLY_PAN:if(!1===u.enableZoom&&!1===u.enablePan)return;!function(e){u.enableZoom&&B(e),u.enablePan&&V(e)}(e),u.update();break;case l.TOUCH_DOLLY_ROTATE:if(!1===u.enableZoom&&!1===u.enableRotate)return;!function(e){u.enableZoom&&B(e),u.enableRotate&&U(e)}(e),u.update();break;default:b=l.NONE}}function ee(e){!1!==u.enabled&&(u.dispatchEvent(p),b=l.NONE)}function te(e){!1!==u.enabled&&e.preventDefault()}u.domElement.addEventListener("contextmenu",te,!1),u.domElement.addEventListener("pointerdown",K,!1),u.domElement.addEventListener("wheel",W,!1),u.domElement.addEventListener("touchstart",Q,!1),u.domElement.addEventListener("touchend",ee,!1),u.domElement.addEventListener("touchmove",$,!1),u.domElement.addEventListener("keydown",J,!1),-1===u.domElement.tabIndex&&(u.domElement.tabIndex=0),this.update()};a.prototype=Object.create(o.m.prototype),a.prototype.constructor=a;var i=function(e,t){a.call(this,e,t),this.screenSpacePanning=!1,this.mouseButtons.LEFT=o.F.PAN,this.mouseButtons.RIGHT=o.F.ROTATE,this.touches.ONE=o.jb.PAN,this.touches.TWO=o.jb.DOLLY_ROTATE};i.prototype=Object.create(o.m.prototype),i.prototype.constructor=i}}]);