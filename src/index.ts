// @ts-ignore
import { addNamed } from '@babel/helper-module-imports'
import type babel from 'babel-core'
import type { NodePath } from 'babel-traverse'
import requireFromString from 'require-from-string'
import { resolve as resolvePath } from 'path'
import packageJson from '../package.json'

const filterFalsy = <T>(array: Array<T | undefined | false | null>) => array.filter(Boolean) as T[]

type Babel = typeof babel
type JSXAttribute = babel.types.JSXAttribute
type Expression = babel.types.Expression
type ObjectExpression = babel.types.ObjectExpression

type StyleObject = Record<string, string | number>
type TailwindFunction = (classes: string) => StyleObject

type PluginOptions = {
  tailwindRNExportPath?: string,
  tailwindRNExportName?: string,
}

type Path = NodePath<JSXAttribute>
export default ({ types: t, transformFileSync }: Babel): babel.PluginObj => {
  const getObjectExpression = (styleObject: StyleObject): ObjectExpression | undefined => {
    if (!Object.keys(styleObject).length) return

    return t.objectExpression(
      Object.entries(styleObject).map(([key, value]) => t.objectProperty(
        t.identifier(key),
        typeof value === 'number' ? t.numericLiteral(value) : t.stringLiteral(value),
      )),
    )
  }

  const getClassNameExpression = (nodeValue: JSXAttribute['value']): Expression | undefined => {
    if (t.isStringLiteral(nodeValue)) return nodeValue
    if (t.isJSXExpressionContainer(nodeValue)) return nodeValue.expression
  }

  const getTailwindFunction = (options: PluginOptions): TailwindFunction => {
    if (!options.tailwindRNExportPath) {
      return require('tailwind-rn')
    }

    const { code } = transformFileSync(options.tailwindRNExportPath)

    return requireFromString(code!)[options.tailwindRNExportName || 'default']
  }

  const createHelpers = (path: Path, options: PluginOptions = {}) => {
    const tailwind = getTailwindFunction(options)

    const getTailwindExpression = (classesExpression: Expression | undefined): Expression[] | undefined => {
      if (!classesExpression) return

      if (t.isTemplateLiteral(classesExpression)) {
        const styleObject = tailwind(
          classesExpression.quasis
            .map((templateElement) => templateElement.value.raw.trim())
            .filter(Boolean)
            .join(' '),
        )
        const templateParamsExpressions = classesExpression.expressions

        return filterFalsy([
          getObjectExpression(styleObject),
          ...templateParamsExpressions.flatMap(getTailwindExpression),
        ])
      }

      if (t.isStringLiteral(classesExpression)) {
        const styleObject = tailwind(classesExpression.value)

        return filterFalsy([getObjectExpression(styleObject)])
      }

      const tailwindIdentifier = addNamed(
        path,
        options.tailwindRNExportName || 'default',
        options.tailwindRNExportPath ? resolvePath(options.tailwindRNExportPath) : 'tailwind-rn',
      )

      return [t.callExpression(tailwindIdentifier, [classesExpression])]
    }

    const getStyleExpressionAndRemoveStyleNode = (): Expression | undefined => {
      if (!Array.isArray(path.container)) return

      const container: JSXAttribute[] = path.container as any

      const styleNodeIndex = container.findIndex(({ name }) => name.name === 'style')

      if (styleNodeIndex === -1) return

      const styleNodeValue = container[styleNodeIndex].value

      if (!t.isJSXExpressionContainer(styleNodeValue)) return

      const styleExpression = styleNodeValue.expression

      path.getSibling(styleNodeIndex).remove()

      return styleExpression
    }

    return {
      getTailwindExpression,
      getStyleExpressionAndRemoveStyleNode,
    }
  }

  return {
    name: packageJson.name,
    visitor: {
      JSXAttribute(path, { opts }: { opts: PluginOptions }) {
        const { node } = path

        if (node.name.name !== 'className') return

        const {
          getStyleExpressionAndRemoveStyleNode,
          getTailwindExpression,
        } = createHelpers(path, opts)

        const styleExpression = getStyleExpressionAndRemoveStyleNode()

        const classesExpression = getClassNameExpression(node.value)

        const tailwindExpression = getTailwindExpression(classesExpression)

        if (!tailwindExpression || !tailwindExpression.length) {
          path.remove()
          return
        }

        node.name.name = 'style'
        node.value = t.jSXExpressionContainer(
          t.arrayExpression(
            filterFalsy([...tailwindExpression, styleExpression]),
          ),
        )
      },
    },
  }
}
