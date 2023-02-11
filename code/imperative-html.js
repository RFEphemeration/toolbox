!function(e){"use strict";var t=e&&e.__values||function(e){var t="function"==typeof Symbol&&Symbol.iterator,r=t&&e[t],n=0;if(r)return r.call(e);if(e&&"number"==typeof e.length)return{next:function(){return e&&n>=e.length&&(e=void 0),{value:e&&e[n++],done:!e}}};throw new TypeError(t?"Object is not iterable.":"Symbol.iterator is not defined.")},r=e&&e.__read||function(e,t){var r="function"==typeof Symbol&&e[Symbol.iterator];if(!r)return e;var n,o,a=r.call(e),i=[];try{for(;(void 0===t||t-- >0)&&!(n=a.next()).done;)i.push(n.value)}catch(e){o={error:e}}finally{try{n&&!n.done&&(r=a.return)&&r.call(a)}finally{if(o)throw o.error}}return i},n=e&&e.__spread||function(){for(var e=[],t=0;t<arguments.length;t++)e=e.concat(r(arguments[t]));return e};function o(e,r){var a,i,l,c,f,u;try{for(var s=t(r),d=s.next();!d.done;d=s.next()){var p=d.value;if(p instanceof Node)e.appendChild(p);else if("string"==typeof p)e.appendChild(document.createTextNode(p));else if("function"==typeof p)o(e,[p()]);else if(Array.isArray(p))o(e,p);else if(p&&"undefined"!=typeof Symbol&&"function"==typeof p[Symbol.iterator])o(e,n(p));else if(p&&p.constructor===Object&&e instanceof Element)try{for(var m=(l=void 0,t(Object.keys(p))),y=m.next();!y.done;y=m.next()){var h=y.value,g=p[h];if("class"===h)"string"==typeof g?e.setAttribute("class",g):Array.isArray(p)||g&&"undefined"!=typeof Symbol&&"function"==typeof g[Symbol.iterator]?e.setAttribute("class",n(g).join(" ")):console.warn("Invalid "+h+' value "'+g+'" on '+e.tagName+" element.");else if("style"===h)if(g&&g.constructor===Object)try{for(var v=(f=void 0,t(Object.keys(g))),b=v.next();!b.done;b=v.next()){var w=b.value;w in e.style?e.style[w]=g[w]:e.style.setProperty(w,g[w])}}catch(e){f={error:e}}finally{try{b&&!b.done&&(u=v.return)&&u.call(v)}finally{if(f)throw f.error}}else e.setAttribute(h,g);else"function"==typeof g?e[h]=g:"boolean"==typeof g?g?e.setAttribute(h,""):e.removeAttribute(h):e.setAttribute(h,g)}}catch(e){l={error:e}}finally{try{y&&!y.done&&(c=m.return)&&c.call(m)}finally{if(l)throw l.error}}else e.appendChild(document.createTextNode(p))}}catch(e){a={error:e}}finally{try{d&&!d.done&&(i=s.return)&&i.call(s)}finally{if(a)throw a.error}}return e}var a="http://www.w3.org/2000/svg";function i(){for(var e=[],t=0;t<arguments.length;t++)e[t]=arguments[t];return document.createRange().createContextualFragment(e.join())}function l(){for(var e=[],t=0;t<arguments.length;t++)e[t]=arguments[t];for(var r=document.createDocumentFragment(),n=(new DOMParser).parseFromString('<svg xmlns="http://www.w3.org/2000/svg">'+e.join()+"</svg>","image/svg+xml").documentElement;null!==n.firstChild;)document.importNode(n.firstChild,!0),r.appendChild(n.firstChild);return r}var c,f,u,s,d=e&&e.__values||function(e){var t="function"==typeof Symbol&&Symbol.iterator,r=t&&e[t],n=0;if(r)return r.call(e);if(e&&"number"==typeof e.length)return{next:function(){return e&&n>=e.length&&(e=void 0),{value:e&&e[n++],done:!e}}};throw new TypeError(t?"Object is not iterable.":"Symbol.iterator is not defined.")};if(e.HTML=i,e.SVG=l,"undefined"!=typeof Proxy){var p=/[A-Z]/g;try{p=new RegExp("\\p{Uppercase}","ug")}catch(e){}e.HTML=new Proxy(i,{get:function(e,t){var r=t.replace(p,(function(e){return"-"+e.toLowerCase()})).replace(/^-/,"").replace(/_/g,"-");return function(){for(var e=[],t=0;t<arguments.length;t++)e[t]=arguments[t];return o(document.createElement(r),e)}}}),e.SVG=new Proxy(l,{get:function(e,t){var r=t.replace(/_/g,"-");return function(){for(var e=[],t=0;t<arguments.length;t++)e[t]=arguments[t];return o(document.createElementNS(a,r),e)}}})}else{console.warn("imperative-html could not find a definition for Proxy, which means that custom elements won't be supported! Try a newer browser.");var m=function(t){e.HTML[t]=function(){for(var e=[],r=0;r<arguments.length;r++)e[r]=arguments[r];return o(document.createElement(t),e)}};try{for(var y=d("a abbr address area article aside audio b base bdi bdo blockquote br button canvas caption cite code col colgroup datalist dd del details dfn dialog div dl dt em embed fieldset figcaption figure footer form h1 h2 h3 h4 h5 h6 header hr i iframe img input ins kbd label legend li link main map mark menu menuitem meta meter nav noscript object ol optgroup option output p param picture pre progress q rp rt ruby s samp script section select small source span strong style sub summary sup table tbody td template textarea tfoot th thead time title tr track u ul var video wbr".split(" ")),h=y.next();!h.done;h=y.next()){m(h.value)}}catch(e){c={error:e}}finally{try{h&&!h.done&&(f=y.return)&&f.call(y)}finally{if(c)throw c.error}}var g=function(t){if(e.SVG[t]=function(){for(var e=[],r=0;r<arguments.length;r++)e[r]=arguments[r];return o(document.createElementNS(a,t),e)},/-/.test(t)){var r=t.replace(/-/g,"_");e.SVG[r]=function(){for(var e=[],r=0;r<arguments.length;r++)e[r]=arguments[r];return o(document.createElementNS(a,t),e)}}};try{for(var v=d("a altGlyph altGlyphDef altGlyphItem animate animateMotion animateTransform circle clipPath color-profile cursor defs desc discard ellipse feBlend feColorMatrix feComponentTransfer feComposite feConvolveMatrix feDiffuseLighting feDisplacementMap feDistantLight feDropShadow feFlood feFuncA feFuncB feFuncG feFuncR feGaussianBlur feImage feMerge feMergeNode feMorphology feOffset fePointLight feSpecularLighting feSpotLight feTile feTurbulence filter font font-face font-face-format font-face-name font-face-src font-face-uri foreignObject g glyph glyphRef hkern image line linearGradient marker mask metadata missing-glyph mpath path pattern polygon polyline radialGradient rect script set stop style svg switch symbol text textPath title tref tspan use view vkern".split(" ")),b=v.next();!b.done;b=v.next()){g(b.value)}}catch(e){u={error:e}}finally{try{b&&!b.done&&(s=v.return)&&s.call(v)}finally{if(u)throw u.error}}}e.applyToElement=function(e){for(var t=[],r=1;r<arguments.length;r++)t[r-1]=arguments[r];return e instanceof Element||e instanceof DocumentFragment?o(e,t):(console.warn("Couldn't apply to provided argument because it's not an element or DocumentFragment."),e)},e.replaceScriptWith=function(){for(var e=[],t=0;t<arguments.length;t++)e[t]=arguments[t];var r=document.currentScript;if(null==r){if("loading"===document.readyState){var n=document.getElementsByTagName("script");r=n[n.length-1]}if(null==r)return void console.warn("Couldn't replace script because no script is currently being parsed and executed, maybe this is happening in a callback function or event handler instead?")}null!==r.parentNode?r.parentNode.replaceChild(o(document.createDocumentFragment(),e),r):console.warn("Couldn't replace script element because it is not attached to a parent anymore, did you try to replace the same script more than once?")}}(this.window=this.window||{});
//# sourceMappingURL=elements.min.js.map
