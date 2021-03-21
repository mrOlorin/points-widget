const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const {CleanWebpackPlugin} = require('clean-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = env => {
    const mode = env?.WEBPACK_SERVE ? 'development' : 'production';
    return {
        entry: {
            main: './src/main.ts',
        },
        mode,
        module: {
            rules: [
                {
                    test: /\.((c|sa|sc)ss)$/i,
                    use: [
                        "style-loader",
                        {
                            loader: "css-loader",
                            options: {
                                importLoaders: 2,
                                modules: { auto: true },
                            },
                        },
                        {
                            loader: "sass-loader",
                        },
                    ],
                },
                {
                    test: /\.(png|jpe?g|gif|svg|eot|ttf|woff|woff2)$/i,
                    loader: "url-loader",
                    options: {
                        limit: 8192,
                    },
                },
                {
                    test: /\.tsx?$/,
                    use: 'ts-loader',
                    exclude: /node_modules/,
                },
                {
                    test: /\.glsl$/,
                    loader: 'webpack-glsl-loader'
                },
                {
                    test: /\.html$/i,
                    loader: 'html-loader',
                },
            ],
        },
        resolve: {
            fallback: {
                stream: false
            },
            extensions: ['.ts', '.js', '.glsl'],
            modules: [
                path.resolve(__dirname, 'src'),
                path.resolve(__dirname, 'node_modules')
            ],
        },
        plugins: [
            new CleanWebpackPlugin(),
            new CopyWebpackPlugin({
                patterns: [
                    {
                        from: 'src/assets/**/*',
                        to: './assets',
                        noErrorOnMissing: true,
                        transformPath: (targetPath) => {
                            return targetPath
                                .replace('src/assets/', '')
                                .replace('src\\assets\\', '');
                        }
                    },
                ],
            }),
            new HtmlWebpackPlugin({
                filename: `index.html`,
                template: `./src/index.html`,
                scriptLoading: 'defer',
                minify: false,
                inject: true,
                chunks: ['main'],
            }),
        ],
        output: {
            path: path.resolve(__dirname, 'dist'),
            publicPath: '',
            filename: '[name]-[id].js',
            sourceMapFilename: '[name]-[id].map',
            chunkFilename: '[name]-[id].js'
        },
        optimization: {
            splitChunks: {
                chunks: 'all',
            }
        },
        devtool: mode === 'development' ? 'eval-cheap-source-map' : false,
        devServer: {
            contentBase: 'dist',
            compress: false,
            port: 3000,
            hot: true,
        },
    }
};
