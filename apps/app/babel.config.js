// Inline Babel visitor: replace every `import.meta` expression with `({})`
// so that `import.meta.url`, `import.meta.env`, etc. become `undefined`
// in the Metro web bundle rather than a SyntaxError.
function transformImportMeta() {
  return {
    visitor: {
      MetaProperty(path) {
        if (
          path.node.meta.name === 'import' &&
          path.node.property.name === 'meta'
        ) {
          path.replaceWithSourceString('({})')
        }
      },
    },
  }
}

module.exports = function (api) {
  api.cache(true)
  return {
    presets: [
      ['babel-preset-expo', { jsxImportSource: 'nativewind' }],
    ],
    plugins: [transformImportMeta],
  }
}
