/* save-local.js v1.0 — только localStorage (без облака Яндекса) для RuStore */
'use strict';
(function () {
  window.AVT_Cloud = {
    ready: false,
    queueSave: function () {},
    flushSave: function () {},
    reset: function () { return Promise.resolve(true); }
  };
  console.log('[save-local] localStorage only');
})();
