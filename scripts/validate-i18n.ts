import fs from 'node:fs'
import path from 'node:path'
import ts from 'typescript'
import { esPY } from '../src/i18n/es-PY'
import { gnPY } from '../src/i18n/gn-PY'
import { ptBR } from '../src/i18n/pt-BR'

type Dict = Record<string, unknown>

const ROOT = process.cwd()
const localeFiles = [
  path.join(ROOT, 'src/i18n/pt-BR.ts'),
  path.join(ROOT, 'src/i18n/es-PY.ts'),
  path.join(ROOT, 'src/i18n/gn-PY.ts'),
]

const flatten = (obj: Dict, base = ''): string[] => {
  const keys: string[] = []
  for (const [key, value] of Object.entries(obj)) {
    const current = base ? `${base}.${key}` : key
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      keys.push(...flatten(value as Dict, current))
    } else {
      keys.push(current)
    }
  }
  return keys
}

const extractDuplicatePaths = (filePath: string): string[] => {
  const sourceText = fs.readFileSync(filePath, 'utf-8')
  const source = ts.createSourceFile(filePath, sourceText, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS)
  const duplicates: string[] = []

  const walkObject = (node: ts.ObjectLiteralExpression, parentPath: string) => {
    const seen = new Set<string>()

    for (const prop of node.properties) {
      if (!ts.isPropertyAssignment(prop) && !ts.isShorthandPropertyAssignment(prop)) continue

      const nameNode = prop.name
      if (!nameNode) continue

      let key = ''
      if (ts.isIdentifier(nameNode) || ts.isStringLiteral(nameNode)) {
        key = nameNode.text
      } else {
        continue
      }

      const currentPath = parentPath ? `${parentPath}.${key}` : key
      if (seen.has(key)) {
        duplicates.push(currentPath)
      } else {
        seen.add(key)
      }

      if (ts.isPropertyAssignment(prop) && ts.isObjectLiteralExpression(prop.initializer)) {
        walkObject(prop.initializer, currentPath)
      }
    }
  }

  const visit = (node: ts.Node) => {
    if (ts.isVariableDeclaration(node) && node.initializer && ts.isObjectLiteralExpression(node.initializer)) {
      walkObject(node.initializer, '')
    }
    ts.forEachChild(node, visit)
  }

  visit(source)
  return duplicates
}

const ptKeys = new Set(flatten(ptBR as unknown as Dict))
const esKeys = new Set(flatten(esPY as unknown as Dict))
const gnKeys = new Set(flatten(gnPY as unknown as Dict))

const missingInEs = [...ptKeys].filter((key) => !esKeys.has(key))
const missingInGn = [...ptKeys].filter((key) => !gnKeys.has(key))
const orphanInEs = [...esKeys].filter((key) => !ptKeys.has(key))
const orphanInGn = [...gnKeys].filter((key) => !ptKeys.has(key))
const duplicateKeys = localeFiles.flatMap(extractDuplicatePaths)

const hasError =
  missingInEs.length > 0
  || missingInGn.length > 0
  || orphanInEs.length > 0
  || orphanInGn.length > 0
  || duplicateKeys.length > 0

if (hasError) {
  console.error('Falha na validacao de i18n:')

  if (missingInEs.length > 0) {
    console.error(`- Chaves faltando em es-PY: ${missingInEs.length}`)
    console.error(missingInEs.join('\n'))
  }

  if (missingInGn.length > 0) {
    console.error(`- Chaves faltando em gn-PY: ${missingInGn.length}`)
    console.error(missingInGn.join('\n'))
  }

  if (orphanInEs.length > 0) {
    console.error(`- Chaves orfas em es-PY: ${orphanInEs.length}`)
    console.error(orphanInEs.join('\n'))
  }

  if (orphanInGn.length > 0) {
    console.error(`- Chaves orfas em gn-PY: ${orphanInGn.length}`)
    console.error(orphanInGn.join('\n'))
  }

  if (duplicateKeys.length > 0) {
    console.error(`- Chaves duplicadas detectadas: ${duplicateKeys.length}`)
    console.error(duplicateKeys.join('\n'))
  }

  process.exit(1)
}

console.log('Validacao i18n aprovada: sem chaves faltantes, duplicadas ou orfas.')
console.log(`Total de chaves pt-BR: ${ptKeys.size}`)
console.log(`Total de chaves es-PY: ${esKeys.size}`)
console.log(`Total de chaves gn-PY: ${gnKeys.size}`)
