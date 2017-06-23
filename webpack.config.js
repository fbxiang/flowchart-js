var path = require('path');
var HTMLWebpackPlugin = require('html-webpack-plugin');

module.exports = {
    entry: "./frontend/entry.js",
    output: {
        path: path.resolve(__dirname, "dist"),
        filename: "bundle.js"
    },
    plugins: [new HTMLWebpackPlugin({
        template: './frontend/index.html'
    })],
    module: {
        rules: [
            {test: /\.css$/, use: [
                {loader: 'style-loader'},
                {loader: 'css-loader'}
            ]}
        ]
    },
    devServer: {
        contentBase: path.join(__dirname, "dist"),
        compress: true,
        port: 8080
    }
};
