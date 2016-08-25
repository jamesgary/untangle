module.exports = {
  entry: "./js/main.js",
  output: {
    path: __dirname + "/public/",
    filename: "app.js",
  },
  devServer: {
    contentBase: "./public",
  },
  devtool: "#source-map",

  module: {
    loaders: [
      {
        test: /\.css$/,
        loader: "style!css"
      }, {
        test: /\.jsx?$/,
        exclude: /(node_modules|bower_components)/,
        loader: 'babel', // 'babel-loader' is also a legal name to reference
        query: {
          presets: ['react', 'es2015']
        }
      }, {
        test: /\.scss$/,
        loaders: ["style", "css", "sass"]
      }
    ]
  },
};
