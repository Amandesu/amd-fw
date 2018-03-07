
const webpack = require("webpack");
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const autoprefixer = require('autoprefixer');
const LessPluginCleanCSS = require('less-plugin-clean-css');
const paths = require("./paths");
const alias = require("./alias");


const cssFilename = 'css/[name].[contenthash:8].css';

module.exports = {
    entry:[
        'webpack/hot/dev-server',
        paths.appIndexJs,
    ],
    output: {
        path: paths.appBuild,
        pathinfo: true,
        filename: 'js/bundle.js',
        chunkFilename: 'js/[name].chunk.js',
        publicPath: '/',
    },
    devtool: 'cheap-module-source-map',
    resolve: {
        modules: ['node_modules', paths.appNodeModules, paths.appSrc],
        extensions: ['.web.js', '.js', '.json', '.web.jsx', '.jsx'],
        alias,
        plugins: [
            //new ModuleScopePlugin(paths.appSrc),
        ],
      },
    module:{
        rules:[
            {
                test:/\.jsx?$/,
                include:paths.appSrc,
                loader: 'babel-loader', 
                options:{
                    cacheDirectory:true
                }
            },
            {
                test: /\.less$/,
                use: [
                    {
                        loader: "style-loader"
                    },
                    {
                        loader: "css-loader", options: {
                            sourceMap: true
                        }
                    },
                    {
                        loader: require.resolve('postcss-loader'),
                        options: {
                        ident: 'postcss', 
                        plugins: () => [
                            autoprefixer({
                                browsers: [
                                    '>1%',
                                    'last 4 versions',
                                    'Firefox ESR',
                                    'not ie < 9', // React doesn't support IE8 anyway
                                ],
                                flexbox: 'no-2009',
                            }),
                        ],
                        },
                    },
                    {
                        loader: "less-loader", options: {
                            sourceMap: true,
                            plugins: [
                                new LessPluginCleanCSS({ advanced: true })
                            ]
                        }
                    }
                ]
            },
            {
                test: /\.css$/,
                loader: ExtractTextPlugin.extract(
                  Object.assign(
                    {
                      fallback: require.resolve('style-loader'),
                      use: [
                        {
                          loader: require.resolve('css-loader'),
                          options: {
                            importLoaders: 1,
                            minimize: true,
                            sourceMap: true,
                          },
                        },
                        {
                          loader: require.resolve('postcss-loader'),
                          options: {
                            ident: 'postcss',
                            plugins: () => [
                              require('postcss-flexbugs-fixes'),
                              autoprefixer({
                                browsers: [
                                  '>1%',
                                  'last 4 versions',
                                  'Firefox ESR',
                                  'not ie < 9',
                                ],
                                flexbox: 'no-2009',
                              }),
                            ],
                          },
                        },
                      ],
                    }
                  )
                ),
            },
        ]
    },
    plugins: [
        // html
        new HtmlWebpackPlugin({
            inject: true,
            template: paths.appHtml,
        }),
        // css
        new ExtractTextPlugin({
            filename: cssFilename,
        }),
        new webpack.HotModuleReplacementPlugin()
    ]
}