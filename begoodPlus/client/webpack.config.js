
const MiniCssExtractPlugin = require("mini-css-extract-plugin");


let mode = "development";

if(process.env.NODE_ENV === "production") {
    mode = "production";
    console.log('moving to production!!!');
}

module.exports = {
    mode: "production", 

    module: {
        rules: [
            {
                test: /\.s?css$/i,
                use: [MiniCssExtractPlugin.loader, 
                    'css-loader',
                    'postcss-loader',
                    'sass-loader'],
            },
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: {
                    loader: "babel-loader",
                }
            }
        ]
    },
    plugins: [new MiniCssExtractPlugin()],

    devtool: "source-map",
    devServer: {
        contentBase: "./dist",
    }
}