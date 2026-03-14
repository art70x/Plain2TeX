import { defineConfig } from 'oxfmt'

export default defineConfig({
  semi: false,
  singleQuote: true,
  tabWidth: 2,
  printWidth: 100,
  sortTailwindcss: {
    stylesheet: './src/main.css',
    preserveWhitespace: true,
    preserveDuplicates: true,
  },
  attributeGroups: ['^className$', '$DEFAULT', '^title$', '^aria-', '^data-'],
  cssDeclarationSorterOrder: 'frakto',
  cssDeclarationSorterKeepOverrides: false,
  sortImports: {
    type: 'natural',
    order: 'asc',
  },
  ignorePatterns: [],
})
