// Starts a dev server for `npm test` on port 3100 with a throwaway database and its own build folder,
// so test accounts, vendors and orders never land in the database you use for `npm run dev`.
import { spawn } from 'node:child_process'
import { rmSync } from 'node:fs'
import path from 'node:path'

const root = path.resolve(import.meta.dirname, '..')
const testDataDir = path.join(root, 'data', 'test')
rmSync(testDataDir, { recursive: true, force: true })

const nextBin = path.join(root, 'node_modules', 'next', 'dist', 'bin', 'next')
const child = spawn(process.execPath, [nextBin, 'dev', '-p', '3100'], {
  cwd: root,
  stdio: 'inherit',
  env: { ...process.env, NEXT_DIST_DIR: '.next-test', DATABASE_PATH: path.join(testDataDir, 'mrittika.db') },
})
child.on('exit', code => process.exit(code ?? 0))
for (const signal of ['SIGINT', 'SIGTERM']) process.on(signal, () => child.kill(signal))
