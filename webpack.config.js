var path = require('path');
var HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  entry: "./frontend/index.ts",
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "bundle.js"
  },
  resolve: {
    extensions: [".webpack.js", ".web.js", ".ts", ".tsx", ".js"]
  },
  plugins: [new HtmlWebpackPlugin({
    template: "./frontend/index.html"
  })],
  module: {
    loaders: [
      {test: /\.tsx?$/, loader: "ts-loader"},
      {test: /\.css/, loader: "style-loader!css-loader"}
    ]
  },
  devServer: {
    contentBase: path.join(__dirname, "dist"),
    compress: true,
    port: 8080
  }
};
