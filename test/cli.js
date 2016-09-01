import test from 'ava';
import execa from 'execa';
import {resolve} from 'path';
import {readFileSync, unlinkSync} from 'fs';

test('bin/svgsus', t => run(t).catch(io => t.regex(io.stdout, /Usage: /)))
test('bin/svgsus cashapelayer < fixtures/coin.original.svg', t => run(t))
test('bin/svgsus jade < fixtures/coin.original.svg', t => run(t))
test('bin/svgsus pug < fixtures/coin.original.svg', t => run(t))
test('bin/svgsus svg < fixtures/coin.original.svg', t => run(t))
test('bin/svgsus uibezierpath < fixtures/coin.original.svg', t => run(t))
test('bin/svgsus vectordrawable < fixtures/coin.original.svg', t => run(t))
test('bin/svgsus missing < fixtures/coin.original.svg', t => run(t).catch(io => t.falsy(io.stout) && t.regex(io.stderr, /not a valid format/)))
test('bin/svgsus pug fixtures/coin.original.svg', t => run(t).then(cleanup('coin.original.pug')))
test('bin/svgsus pug fixtures/coin.original.svg fixtures/logo-defs.original.svg', t => run(t).then(cleanup('coin.original.pug', 'logo-defs.original.pug')))
test('bin/svgsus pug --output fixtures -- fixtures/coin.original.svg fixtures/logo-defs.original.svg', t => run(t).then(cleanup('fixtures/coin.original.pug', 'fixtures/logo-defs.original.pug')))
test('bin/svgsus cashapelayer fixtures/coin.original.svg fixtures/logo-defs.original.svg', t => run(t).then(cleanup('svgsus.swift')))
test('bin/svgsus cashapelayer --output ca-multi.swift fixtures/coin.original.svg fixtures/logo-defs.original.svg', t => run(t).then(cleanup('ca-multi.swift')))
test('bin/svgsus cashapelayer --output ca-single.swift < fixtures/coin.original.svg', t => run(t).then(cleanup('ca-single.swift')))
test('bin/svgsus uibezierpath --output ui-single.swift < fixtures/coin.original.svg', t => run(t).then(cleanup('ui-single.swift')))
test('bin/svgsus svg --output svg-single.svg fixtures/coin.original.svg', t => run(t).then(cleanup('svg-single.svg')))
test('bin/svgsus svg --output svg-fail-single.svg fixtures/coin.original.svg fixtures/logo-defs.original.svg', t => run(t).catch(io => t.regex(io.stderr, /multiple files require --output to be a directory/)))
test('bin/svgsus svg fixtures/coin.original.svg fixtures/logo-defs.original.svg', t => run(t).then(cleanup('coin.original.svg', 'logo-defs.original.svg')))

function run(t) {
  const args = t.title.split(' ')
  const cmd = resolve(__dirname, '..', args.shift())
  const opts = {}

  if (args.indexOf('<') != -1) {
    const file = args.pop()
    opts.input = readFileSync(resolve(__dirname, file), 'utf8')
    args.pop()
  }

  return execa(cmd, args, opts)
}

function cleanup() {
  const paths = [].slice.call(arguments).map(path => resolve(__dirname, path))
  return () => new Promise(resolve => {
    paths.forEach(path => unlinkSync(path))
    resolve()
  })
}