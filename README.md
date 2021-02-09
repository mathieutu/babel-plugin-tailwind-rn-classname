# babel-plugin-tailwind-rn-classname

[![Version](https://img.shields.io/npm/v/babel-plugin-tailwind-rn-classname.svg?style=flat-square)](https://www.npmjs.com/package/babel-plugin-tailwind-rn-classname?activeTab=versions)
[![Downloads](https://img.shields.io/npm/dt/babel-plugin-tailwind-rn-classname.svg?style=flat-square)](https://www.npmjs.com/package/babel-plugin-tailwind-rn-classname)
[![License](https://img.shields.io/github/license/mathieutu/babel-plugin-tailwind-rn-classname.svg?style=flat-square)](https://github.com/mathieutu/babel-plugin-tailwind-rn-classname/blob/master/LICENSE)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square)](https://github.com/mathieutu/babel-plugin-tailwind-rn-classname/blob/master/CONTRIBUTING.md)

Babel plugin to use your tailwind classes directly in React Native.

You will have standard autocompletion from you IDE, and your tailwind plugins will work like in a standard React app.

It has an optimised behaviour: <br>
it detects static classes and convert them to object directly at transpilation time for better performances, and let the
dynamic ones for runtime.

It uses [tailwind-rn](https://github.com/vadimdemedes/tailwind-rn) package under the hood, which is a peer dependency.

<img src=".github/assets/header.png" alt="header demo">

## Installation

```shell
yarn add tailwind-rn
yarn add -D babel-plugin-tailwind-rn-classname
```

or

```shell
npm install --save tailwind-rn
npm install --save-dev babel-plugin-tailwind-rn-classname
```

## Setup

### Basic

Add it to your `.babelrc` (or any Babel config file)

```json
{
  "plugins": [
    "...",
    "tailwind-rn-classname"
  ]
}
```

### Custom

If you want to customise your styles as described in
the [tailwind-rn documentation](https://github.com/vadimdemedes/tailwind-rn#customization), you can pass options to the
plugin:

```json
{
  "plugins": [
    "...",
    [
      "tailwind-rn-classname",
      {
        "tailwindRNExportPath": "my/custom/module",
        "tailwindRNExportName": "tailwind"
      }
    ]
  ]
}
```

| option                 | description                                                                                   | default value |
|------------------------|-----------------------------------------------------------------------------------------------|---------------|
| `tailwindRNExportPath` | Path to your file from your current working directory (usualy same than your  `package.json`) | `tailwind-rn` |
| `tailwindRNExportName` | Name of your export in the file                                                               | `default`     |

So considering a root `tailwindRN.ts` file which contains:

```js
import { create } from 'tailwind-rn';
import styles from './styles.json';

const { tailwind, getColor } = create(styles);

export const tw = tailwind
```

the configuration will be:

```json
{
  "plugins": [
    "...",
    [
      "tailwind-rn-classname",
      {
        "tailwindRNExportPath": "./tailwindRN",
        "tailwindRNExportName": "tw"
      }
    ]
  ]
}
```

## Usage

Write your tailwind classes like you would do on standard React app. You can find the list of supported utilities
on [tailwind-rn documentation](https://github.com/vadimdemedes/tailwind-rn#supported-utilities)

```jsx
import { SafeAreaView, View, Text } from 'react-native';

const Component = ({ isAlert = false }) => (
  <SafeAreaView className="h-full">
    <View className="pt-12 items-center">
      <View className={`${isAlert ? 'bg-orange-200' : 'bg-blue-200'} px-3 py-1 rounded-full`}>
        <Text className={`${isAlert ? 'text-orange-800' : 'text-blue-800'} font-semibold`}>
          Hello Tailwind
        </Text>
      </View>
    </View>
  </SafeAreaView>
);
```

<img alt="demo screenshot" src="./.github/assets/demo.png" width="544">

### Static `className`
```jsx
<Text className="pt-12 items-center" />
```

↓ ↓ ↓ ↓ ↓ ↓

```jsx
<Text style={[{ paddingTop: 48, alignItems: 'center' }]} />
```

### Static `className` and `style`

```jsx
<Text className="pt-12 items-center" style={[{ color: 'blue' }]} />
```

↓ ↓ ↓ ↓ ↓ ↓

```jsx
<Text style={[{ paddingTop: 48, alignItems: 'center' }, { color: 'blue' }]} />
```

### Dynamic `className`

```jsx
<Text className={large ? 'px-12' : 'px-4'} />
```

↓ ↓ ↓ ↓ ↓ ↓

```jsx
import tailwind from 'tailwind-rn';

<Text style={[tailwind(large ? 'px-12' : 'px-4')]} />
```

### Dynamic and Static `className`

```jsx
<Text className={`pt-12 ${large ? 'px-12' : 'px-4'} items-center`} />
```

↓ ↓ ↓ ↓ ↓ ↓

```jsx
import tailwind from 'tailwind-rn';

<Text style={[{ paddingTop: 48, alignItems: 'center' }, tailwind(large ? 'px-12' : 'px-4')]} />
```

### Dynamic and Static `className` and `styles`

```jsx
<Text className={`pt-12 ${large ? 'px-12' : 'px-4'} items-center`} style={{color: 'blue'}}/>
```

↓ ↓ ↓ ↓ ↓ ↓

```jsx
import tailwind from 'tailwind-rn';

<Text style={[{ paddingTop: 48, alignItems: 'center' }, tailwind(large ? 'px-12' : 'px-4'), { color: 'blue' }]} />
```

### Dynamic and Static `className` and `styles`

```jsx
<Text className={`pt-12 ${large ? 'px-12' : 'px-4'} items-center`} style={{color: 'blue'}}/>
```

↓ ↓ ↓ ↓ ↓ ↓

```jsx
import tailwind from 'tailwind-rn';

<Text style={[{ paddingTop: 48, alignItems: 'center' }, tailwind(large ? 'px-12' : 'px-4'), { color: 'blue' }]} />
```

### Custom import with configuration

```json
{
  "tailwindRNExportPath": "./tailwindRN",
  "tailwindRNExportName": "tw"
}
```
```jsx
<Text className={large ? 'px-12' : 'px-4'}/>
```

↓ ↓ ↓ ↓ ↓ ↓

```jsx
import { tw } from '/absolute/path/to/my/project/tailwindRN';

<Text style={[tw(large ? 'px-12' : 'px-4')]} />
```

You can find all this cases and more in [the tests](./__tests__/index.spec.ts)



## A bug, a question?

Please feel free to [tell me](https://github.com/mathieutu/babel-plugin-tailwind-rn-classname/issues/new)!


## License

This package is an open-sourced software licensed under the [MIT license](http://opensource.org/licenses/MIT).


## Contributing

Issues and PRs are obviously welcomed and encouraged, for new features as well as documentation.

