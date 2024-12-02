/**
 * Webpack configuration for building the extension in production mode,
 * specifying entry and output settings, module rules, and plugins.
 */
const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');
module.exports = {
    mode: "production",
    // Entry point for the extension
    entry: {
        main: path.resolve(__dirname, "..", "src", "main.ts"),
        timer: path.resolve(__dirname, "..", "src", "timer.ts"),
    },
    // Output configuration for the built files
    output: {
        path: path.join(__dirname, "../dist"),
        filename: "[name].js",
    },
    // Resolve configuration to specify which file extensions to consider
    resolve: {
        extensions: [".ts", ".js"],
    },
    // Module configuration for handling different file types
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                loader: "ts-loader",
                exclude: /node_modules/,
            },
        ],
    },
    // Plugins configuration, copies assets from the 'public' directory
    plugins: [
        new CopyPlugin({
            patterns: [{from: ".", to: ".", context: "public"}]
        }),
    ],
};
