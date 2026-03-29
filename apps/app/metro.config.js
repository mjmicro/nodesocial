const { getDefaultConfig } = require('expo/metro-config')
const { withNativeWind } = require('nativewind/metro')

const config = getDefaultConfig(__dirname)

// Enable package exports resolution so packages with an `exports` field
// use their correct browser/native builds instead of the CJS fallback.
config.resolver.unstable_enablePackageExports = true

module.exports = withNativeWind(config, { input: './src/global.css' })
