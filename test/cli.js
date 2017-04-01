import test from 'ava'
import execa from 'execa'
import { resolve } from 'path'
import { readFileSync, unlinkSync } from 'fs'
import svgsus from '..'

test('bin/svgsus', t => run(t).catch(io => t.regex(io.stdout, /Usage: /)))
test('bin/svgsus cashapelayer < test/fixtures/coin.original.svg', t => run(t))
test('bin/svgsus jade < test/fixtures/coin.original.svg', t => run(t))
test('bin/svgsus pug < test/fixtures/coin.original.svg', t => run(t))
test('bin/svgsus svg < test/fixtures/coin.original.svg', t => run(t))
test('bin/svgsus uibezierpath < test/fixtures/coin.original.svg', t => run(t))
test('bin/svgsus uibezierpath < test/fixtures/coin.original.svg', t => run(t))
test('bin/svgsus svgsymbol --stripStyle < test/fixtures/coin.original.svg', t => run(t))
test('bin/svgsus svgsymbol --invalidOption < test/fixtures/coin.original.svg', t => run(t).catch(io => t.falsy(io.stout) && t.regex(io.stderr, /Usage: /)))
test('bin/svgsus missing < test/fixtures/coin.original.svg', t => run(t).catch(io => t.falsy(io.stout) && t.regex(io.stderr, /not a valid format/)))
test('bin/svgsus pug test/fixtures/coin.original.svg', t => run(t).then(cleanup('coin.original.pug')))
test('bin/svgsus pug test/fixtures/coin.original.svg test/fixtures/logo-defs.original.svg', t => run(t).then(cleanup('coin.original.pug', 'logo-defs.original.pug')))
test('bin/svgsus pug --output test/fixtures -- test/fixtures/coin.original.svg test/fixtures/logo-defs.original.svg', t => run(t).then(cleanup('test/fixtures/coin.original.pug', 'test/fixtures/logo-defs.original.pug')))
test('bin/svgsus cashapelayer --output ca-multi.swift test/fixtures/coin.original.svg test/fixtures/logo-defs.original.svg', t => run(t).then(cleanup('ca-multi.swift')))
test('bin/svgsus cashapelayer --output ca-single.swift < test/fixtures/coin.original.svg', t => run(t).then(cleanup('ca-single.swift')))
test('bin/svgsus uibezierpath --output ui-single.swift < test/fixtures/coin.original.svg', t => run(t).then(cleanup('ui-single.swift')))
test('bin/svgsus svg --output svg-single.svg test/fixtures/coin.original.svg', t => run(t).then(cleanup('svg-single.svg')))
test('bin/svgsus svg --output svg-fail-single.svg test/fixtures/coin.original.svg test/fixtures/logo-defs.original.svg', t => run(t).catch(io => t.regex(io.stderr, /multiple files require --output to be a directory/)))
test('bin/svgsus svg test/fixtures/coin.original.svg test/fixtures/logo-defs.original.svg', t => run(t).then(cleanup('coin.original.svg', 'logo-defs.original.svg')))

Object.keys(svgsus).forEach(format => {
  const ext = svgsus[format].extension

  // all formats should be able to take stdin and write to an output file
  test(`bin/svgsus ${format} --output ${format}-stdin${ext} < test/fixtures/coin.original.svg`, t =>
    run(t).then(cleanup(`${format}-stdin${ext}`))
  )

  // all formats should be able to take a single file and write to an output file
  test(`bin/svgsus ${format} --output ${format}-single${ext} test/fixtures/coin.original.svg`, t =>
    run(t).then(cleanup(`${format}-single${ext}`))
  )

  if (['cashapelayer', 'css', 'uibezierpath', 'svgsymbol'].indexOf(format) === -1) {
    // formats that handle multi by writing multiple files
    test.serial(`bin/svgsus ${format} test/fixtures/coin.original.svg test/fixtures/logo-defs.original.svg`, t =>
      run(t).then(cleanup(`coin.original${ext}`, `logo-defs.original${ext}`))
    )

    test(`bin/svgsus ${format} --output a-file${ext} test/fixtures/coin.original.svg test/fixtures/logo-defs.original.svg`, t =>
      run(t).catch(io => t.regex(io.stderr, /multiple files require --output to be a directory/))
    )
  } else {
    // formats that handle multi by writing to single file
    test(`bin/svgsus ${format} --output ${format}-multi${ext} test/fixtures/coin.original.svg test/fixtures/logo-defs.original.svg`, t =>
      run(t).then(cleanup(`${format}-multi${ext}`))
    )

    test.serial(`bin/svgsus ${format} test/fixtures/coin.original.svg test/fixtures/logo-defs.original.svg`, t =>
      run(t).then(cleanup(format === 'css' || format === 'svgsymbol' ? `coin-original+1${ext}` : `coinOriginal+1${ext}`))
    )
  }
})

function run(t) {
  const args = t.title.split(' ')
  const cmd = resolve(__dirname, '..', args.shift())
  const opts = {}

  if (args.indexOf('<') !== -1) {
    const file = args.pop()
    opts.input = readFileSync(resolve(file), 'utf8')
    args.pop()
  }

  return execa(cmd, args, opts)
}

function cleanup() {
  const paths = [].slice.call(arguments).map(path => resolve(__dirname, '..', path))
  return () => new Promise(resolve => {
    paths.forEach(path => unlinkSync(path))
    resolve()
  })
}
