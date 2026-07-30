// app.json Android 配置验证脚本
const fs = require('fs');
const path = require('path');

const appJsonPath = path.join(__dirname, '..', 'app.json');
const raw = fs.readFileSync(appJsonPath, 'utf8');
const config = JSON.parse(raw);
const android = config.expo?.android;

if (!android) throw new Error('Missing expo.android config');
if (android.minSdkVersion !== 31) throw new Error('Expected minSdkVersion=31, got ' + android.minSdkVersion);
if (android.targetSdkVersion !== 35) throw new Error('Expected targetSdkVersion=35, got ' + android.targetSdkVersion);
if (!android.predictiveBackGestureEnabled) throw new Error('Expected predictiveBackGestureEnabled=true');

console.log('✅ Android config verified:');
console.log('   minSdkVersion:', android.minSdkVersion, '(Android 12)');
console.log('   targetSdkVersion:', android.targetSdkVersion, '(Android 15)');
console.log('   predictiveBackGestureEnabled:', android.predictiveBackGestureEnabled);
console.log('   softwareKeyboardLayoutMode:', android.softwareKeyboardLayoutMode);
