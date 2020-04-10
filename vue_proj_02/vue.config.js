module.exports = {
  // 导入自定义 webpack 配置
  chainWebpack: config => {
    config.when(process.env.NODE_ENV === 'production', config => { // 发布模式
      // 入口文件
      config.entry('app').clear().add('./src/main-prod.js')
      // 配置 CDN 优化项
      config.set('externals', {
        vue: 'Vue',
        'vue-router': 'VueRouter',
        axios: 'axios',
        lodash: '_',
        echarts: 'echarts',
        nprogress: 'NProgress',
        'vue-quill-editor': 'VueQuillEidtor'
      })
      // 添加 isProd 属性，实现 不同模式下的页面 title 以及 CDN 的是否加载
      config.plugin('html').tap(args => {
        args[0].isProd = true
        return args
      })
    })
    config.when(process.env.NODE_ENV === 'development', config => { // 开发模式
      // 添加 isProd 属性，实现 不同模式下的页面 title 以及 CDN 的是否加载
      config.plugin('html').tap(args => {
        args[0].isProd = false
        return args
      })
      // 入口文件
      config.entry('app').clear().add('./src/main-dev.js')
    })
  }
}