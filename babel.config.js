let transformRemoveConsolePlugin = [];
// 生产环境清除console.log的信息
if (process.env.NODE_ENV === "production") {
  transformRemoveConsolePlugin = ["transform-remove-console"];
}

module.exports = {
  plugins: [
    ...transformRemoveConsolePlugin,
    "@babel/plugin-syntax-dynamic-import"
  ]
};
