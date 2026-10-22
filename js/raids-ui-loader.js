/* raids-ui assembler v4.91 */
'use strict';
(function(){
  var p=window.__RAIDS_UI_PARTS;
  if(!p||p.length<3){console.error('[raids-ui] missing parts',p&&p.length);return;}
  var code=p.join('');
  var s=document.createElement('script');
  s.text=code;
  (document.body||document.documentElement).appendChild(s);
})();
