/* eslint-disable max-len,no-template-curly-in-string */
import pluginTester, { prettierFormatter } from 'babel-plugin-tester'
import { resolve as resolvePath } from 'path'
import plugin from '../src/index'
import * as packageJson from '../package.json'

let warnCount = 0
// eslint-disable-next-line no-console,no-plusplus
console.warn = () => warnCount++

// @ts-ignore
pluginTester({
  plugin,
  pluginName: packageJson.name,
  // @ts-ignore todo https://github.com/DefinitelyTyped/DefinitelyTyped/pull/51112
  formatResult: (code) => prettierFormatter(code, { config: { printWidth: 500 } }),
  babelOptions: {
    presets: ['react-native'],
  },
  tests: [
    {
      title: 'it doesn\'t touch standard components',
      code: '<View>content</View>',
      output: 'React.createElement(View, null, "content");',
    },
    {
      title: 'it doesn\'t touch components with only style',
      code: '<View style={{ flexDirection: "row" }}>content</View>',
      output: 'React.createElement(View, { style: { flexDirection: "row" } }, "content");',
    },
    {
      title: 'it converts static classNames during transpilation',
      code: '<View className="flex flex-row h-10">content</View>',
      output: 'React.createElement(View, { style: [{ display: "flex", flexDirection: "row", height: 40 }] }, "content");',
    },
    {
      title: 'it merges static classNames with styles during transpilation',
      code: '<View className="flex flex-row h-10" style={{ color: \'red\' }}>content</View>',
      output: 'React.createElement(View, { style: [{ display: "flex", flexDirection: "row", height: 40 }, { color: "red" }] }, "content");',
    },
    {
      title: 'it does not convert unknown classNames',
      code: '<View className="foo">content</View>',
      output: 'React.createElement(View, null, "content");',
      teardown: () => expect(warnCount).toBe(1),
    },
    {
      title: 'it does not convert unknown classNames, but handles good ones',
      code: '<View className="foo flex">content</View>',
      output: 'React.createElement(View, { style: [{ display: "flex" }] }, "content");',
      teardown: () => expect(warnCount).toBe(2),
    },
    {
      title: 'it handles empty className',
      code: '<View className="">content</View>',
      output: 'React.createElement(View, null, "content");',
    },
    {
      title: 'it converts static className in jsx container and double quotes',
      code: '<View className={"flex flex-row h-10"}>content</View>',
      output: 'React.createElement(View, { style: [{ display: "flex", flexDirection: "row", height: 40 }] }, "content");',
    },
    {
      title: 'it converts static className in jsx container and simple quotes',
      code: '<View className={\'flex flex-row h-10\'}>content</View>',
      output: 'React.createElement(View, { style: [{ display: "flex", flexDirection: "row", height: 40 }] }, "content");',
    },
    {
      title: 'it converts static className in jsx container and template string',
      code: '<View className={`flex flex-row h-10`}>content</View>',
      output: 'React.createElement(View, { style: [{ display: "flex", flexDirection: "row", height: 40 }] }, "content");',
    },
    {
      title: 'it converts static className in jsx container and template string with string params',
      code: '<View className={`flex ${"h-10"} flex-row`}>content</View>',
      output: 'React.createElement(View, { style: [{ display: "flex", flexDirection: "row" }, { height: 40 }] }, "content");',
    },
    {
      title: 'it converts static className in jsx container and template string with empty string params',
      code: '<View className={`flex ${""} flex-row`}>content</View>',
      output: 'React.createElement(View, { style: [{ display: "flex", flexDirection: "row" }] }, "content");',
    },
    {
      title: 'it adds runtime method when it can\'t transpile',
      code: '<View className={prop}>content</View>',
      output: `var _tailwindRn = _interopRequireDefault(require("tailwind-rn"));
function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : { default: obj };
}
React.createElement(View, { style: [(0, _tailwindRn.default)(prop)] }, "content");`,
    },
    {
      title: 'it imports runtime method only once',
      code: '<><View className={prop}>content</View><View className={prop2}>content</View></>',
      output: `var _tailwindRn = _interopRequireDefault(require("tailwind-rn"));
function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : { default: obj };
}
React.createElement(React.Fragment, null, React.createElement(View, { style: [(0, _tailwindRn.default)(prop)] }, "content"), React.createElement(View, { style: [(0, _tailwindRn.default)(prop2)] }, "content"));`,
    },
    {
      title: 'it adds runtime method when it can\'t transpile in template litteral',
      code: '<View className={`h-1 ${prop} flex`}>content</View>',
      output: `var _tailwindRn = _interopRequireDefault(require("tailwind-rn"));
function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : { default: obj };
}
React.createElement(View, { style: [{ height: 4, display: "flex" }, (0, _tailwindRn.default)(prop)] }, "content");`,
    },
    {
      title: 'it can merge everything',
      code: '<View className={`h-1 ${prop} flex`} style={{  color: "red" }}>content</View>',
      output: `var _tailwindRn = _interopRequireDefault(require("tailwind-rn"));
function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : { default: obj };
}
React.createElement(View, { style: [{ height: 4, display: "flex" }, (0, _tailwindRn.default)(prop), { color: "red" }] }, "content");`,
    },
    {
      title: 'it can use custom tailwind function path',
      // @ts-ignore todo https://github.com/DefinitelyTyped/DefinitelyTyped/pull/51112
      pluginOptions: {
        tailwindRNExportPath: '__tests__/custom.ts',
      },
      code: '<View className={`${prop} flex`}>content</View>',
      output: `var _custom = _interopRequireDefault(require("${resolvePath(__dirname, './custom.ts')}"));
function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : { default: obj };
}
React.createElement(View, { style: [{ default: "flex" }, (0, _custom.default)(prop)] }, "content");`,
    },
    {
      title: 'it can use custom tailwind function path and name',
      // @ts-ignore
      pluginOptions: {
        tailwindRNExportPath: '__tests__/custom.ts',
        tailwindRNExportName: 'named',
      },
      code: '<View className={`${prop} flex`}>content</View>',
      output: `var _custom = require("${resolvePath(__dirname, './custom.ts')}");
React.createElement(View, { style: [{ named: "flex" }, (0, _custom.named)(prop)] }, "content");`,
    },
  ],
})
