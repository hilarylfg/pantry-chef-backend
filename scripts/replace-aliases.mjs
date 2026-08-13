#!/usr/bin/env node
// Заменяет все path-alias импорты '@/...' на относительные пути.
// Запуск: node scripts/replace-aliases.mjs
import { readdir, readFile, writeFile } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { join, relative, dirname, sep } from 'node:path'

const SRC_DIR = join(process.cwd(), 'src')
const ALIAS = '@/'

/** Рекурсивно обойти директорию и вернуть все .ts файлы. */
async function walkTs(dir) {
  const entries = await readdir(dir, { withFileTypes: true })
  const files = []
  for (const entry of entries) {
    const full = join(dir, entry.name)
    if (entry.isDirectory()) {
      // пропускаем сгенерированный Prisma-клиент
      if (entry.name === 'generated') continue
      files.push(...(await walkTs(full)))
    } else if (entry.name.endsWith('.ts')) {
      files.push(full)
    }
  }
  return files
}

/** Превратить путь из POSIX (с /) в формат текущей ОС (на win — \\). */
function toOsPath(p) {
  return p.split('/').join(sep)
}

/**
 * Разрешить целевой модуль '@/some/path' в реальный файл на диске,
 * добавляя расширение если нужно.
 */
function resolveModule(fromFile, importPath) {
  if (!importPath.startsWith(ALIAS)) return null

  // 'src/' + 'some/path' => абсолютный путь без расширения
  const targetWithoutExt = join(SRC_DIR, toOsPath(importPath.slice(ALIAS.length)))

  // пробуем разрешить как файл: .ts, /index.ts
  const candidates = [
    targetWithoutExt,
    targetWithoutExt + '.ts',
    targetWithoutExt + '.js',
    join(targetWithoutExt, 'index.ts'),
    join(targetWithoutExt, 'index.js')
  ]
  const resolved = candidates.find(c => existsSync(c))
  if (!resolved) {
    console.warn(`⚠️  Не найден модуль для ${importPath} (из ${fromFile})`)
    return null
  }
  return resolved
}

async function main() {
  const files = await walkTs(SRC_DIR)
  let changedCount = 0
  let totalReplacements = 0

  // Регэксп: захватываем всё внутри кавычек после `from ` или `import(`, начинающееся с @/
  // Покрывает: import { X } from '@/...' и await import('@/...')
  const importRegex = /(from\s+|import\s*\(\s*)'(@\/[^']+)'/g

  for (const file of files) {
    const content = await readFile(file, 'utf8')
    let replacements = 0

    const newContent = content.replace(importRegex, (match, prefix, importPath) => {
      const resolved = resolveModule(file, importPath)
      if (!resolved) return match

      let rel = relative(dirname(file), resolved)
      // нормализуем в POSIX (всегда /)
      rel = rel.split(sep).join('/')

      // 确保 './' prefix для относительных путей в ESM/CJS require
      if (!rel.startsWith('.')) rel = './' + rel

      replacements++
      return `${prefix}'${rel}'`
    })

    if (replacements > 0) {
      await writeFile(file, newContent, 'utf8')
      changedCount++
      totalReplacements += replacements
      console.log(`✓ ${relative(process.cwd(), file).split(sep).join('/')} (${replacements})`)
    }
  }

  console.log(`\nГотово. Изменено файлов: ${changedCount}, замен: ${totalReplacements}`)
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})
