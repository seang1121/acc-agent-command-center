import { readdirSync, copyFileSync, existsSync } from 'node:fs'
import { join } from 'node:path'

const root = join(import.meta.dirname, '..')
const dataDir = join(root, 'src', 'data')
const files = readdirSync(dataDir)

for (const file of files) {
  if (!file.endsWith('.example.json')) continue
  const target = file.replace('.example.json', '.json')
  const targetPath = join(dataDir, target)
  if (!existsSync(targetPath)) {
    copyFileSync(join(dataDir, file), targetPath)
    console.log(`Created ${target} from ${file}`)
  }
}

// Also copy acc.config.example.json → acc.config.json if missing
const configExample = join(root, 'acc.config.example.json')
const configTarget = join(root, 'acc.config.json')
if (existsSync(configExample) && !existsSync(configTarget)) {
  copyFileSync(configExample, configTarget)
  console.log('Created acc.config.json from acc.config.example.json')
}

console.log('Data files initialized.')
