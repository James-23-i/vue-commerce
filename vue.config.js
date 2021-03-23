const path = require('path');        //引入path模块
let webpack = require('webpack')     //引入webpack库
function resolve(dir) {
  return path.join(__dirname, dir)  //path.join(__dirname)设置绝对路径
}
module.exports = {
  chainWebpack: config => {
    // 发布模式
    config.when(process.env.NODE_ENV === 'production', config => {
      config.entry('app').clear().add('./src/main-prod.js')
      config.set('externals', {
        vue: 'Vue',
        'vue-router': 'VueRouter',
        axios: 'axios',
        echarts: 'echarts',
        nprogress: 'NProgress',
        'vue-quill-editor': 'VueQuillEditor'
      })
      config.plugin('html').tap(args => {
        args[0].isProd = true
        return args
      })
    });
    // 开发模式
    config.when(process.env.NODE_ENV === 'development', config => {
      config.entry('app').clear().add('./src/main-dev.js')
      config.plugin('html').tap(args => {
        args[0].isProd = false
        return args
      })
    });

    config.plugin('ignore')
      .use(new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/));//忽略/moment/locale下的所有文件

    config.resolve.alias
      //set第一个参数：设置的别名，第二个参数：设置的路径
      .set('@', resolve('./src'))
      .set('assets', resolve('.src/assets'))
      .set('components', resolve('./src/components'))
      .set('views', resolve('src/views'))
      .set('network', resolve('src/network'))
      .set('utils', resolve('src/utils'))
  }
}

