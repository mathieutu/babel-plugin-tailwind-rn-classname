declare namespace JSX {
  interface IntrinsicAttributes {
    className?: string | undefined | null | false
  }
}

export type PluginOptions = {
  tailwindRNExportPath?: string,
  tailwindRNExportName?: string,
}
