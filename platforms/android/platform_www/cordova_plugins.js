cordova.define('cordova/plugin_list', function(require, exports, module) {
  module.exports = [
    {
      "id": "phonegap-nfc.NFC",
      "file": "plugins/phonegap-nfc/www/phonegap-nfc.js",
      "pluginId": "phonegap-nfc",
      "runs": true
    }
  ];
  module.exports.metadata = {
    "cordova-plugin-whitelist": "1.3.3",
    "phonegap-nfc": "1.0.3"
  };
});