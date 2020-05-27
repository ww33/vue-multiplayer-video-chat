const webpack = require('webpack');

const fs = require('fs');
const packageJson = fs.readFileSync('./package.json');
const version = JSON.parse(packageJson).version || 0;
const time = new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString()
  .slice(0, -5)
  .replace('T', ' ');

module.exports = {
  devServer: {
    https: true,
    port: 443,
    public: '0.0.0.0',
    compress: true,
    disableHostCheck: true,
    overlay: {
      warnings: true,
      errors: true
    },
    proxy: {
      '/janus': {
        //target: 'https://meetup.gekus.ru',
        //target: 'http://192.168.88.22:8088',
        target: 'https://test.meetup.inachi.eu:8089',
        changeOrigin: true,
        onProxyReq: function (request, req, res) {
          //request.setHeader('origin', 'https://meetup.gekus.ru');
          //request.setHeader('origin', 'http://192.168.88.22:8088');
          request.setHeader('origin', 'https://test.meetup.inachi.eu:8089')
        }
      }
    },
  },

  css: {
    loaderOptions: {
      scss: {
        prependData: `@import "@/styles/_main.scss";`
      }
    }
  },

  configureWebpack: {
    plugins: [
      new webpack.DefinePlugin({
        'process.env': {
          PACKAGE_VERSION: '"' + version + '"',
          TIME_OF_BUILD: '"' + time + '"'
        }
      }),
      //new webpack.ProvidePlugin({ adapter: 'webrtc-adapter' }),
    ]
  },

  transpileDependencies: [
    'vuetify'
  ],

  pluginOptions: {
    gitDescribe: {
      variableName: 'GIT_DESCRIBE'
    }
  },

  //publicPath: '/test/'
};
