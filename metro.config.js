const path = require('path');
const {execFileSync} = require('child_process');
const { getDefaultConfig } = require('@react-native/metro-config');

// Ensure .env values are synced before Metro resolves JS modules.
try {
  execFileSync(process.execPath, [path.join(__dirname, 'scripts', 'sync-env.js')], {
    stdio: 'inherit',
  });
} catch (_error) {
  // Keep Metro booting even if env sync fails.
}

const config = getDefaultConfig(__dirname);

module.exports = config;
