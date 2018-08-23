'use strict';

const MiioAdapter = require('./miio-adapter');

module.exports = function(adapterManager, manifest) {
  new MiioAdapter(adapterManager, manifest.name);
};
