'use strict';

document.documentElement.className = (
  !!window.navigator.userAgent.match(/Trident\//i) ||
  !!window.navigator.userAgent.match(/MSIE /i)
) ? 'ms-ie' : '';
