const { getDefaultConfig } = require("expo/metro-config");

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Configure Metro to support WASM files for expo-sqlite
config.resolver.assetExts.push("wasm");
config.transformer.assetPlugins = ["expo-asset/tools/hashAssetFiles"];

module.exports = config;
