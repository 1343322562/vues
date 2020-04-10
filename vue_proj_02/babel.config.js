// 项目发布阶段需要用的 babel 插件
const prodPligins = []
if (process.env.NODE_ENV === 'production') {
  prodPligins.push('transform-remove-console')
}

module.exports = {
  presets: [
    '@vue/cli-plugin-babel/preset'
  ],
  plugins: [
    [
      'component',
      {
        libraryName: 'element-ui',
        styleLibraryName: 'theme-chalk'
      }
    ],
    // 发布产品时的插件数组，去除了 console 函数
    ...prodPligins,
    // 路由懒加载 插件
    '@babel/plugin-syntax-dynamic-import'
  ]
}
