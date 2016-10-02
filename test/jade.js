import test from 'ava'
import {readFileSync} from 'fs'
import {resolve} from 'path'
import {convert, convertAll} from '../lib//jade'

test('logo.2.pug', t => {
  const original = readFileSync(resolve(__dirname, 'fixtures', 'logo.original.svg'), 'utf8')
  const expected = readFileSync(resolve(__dirname, 'fixtures', t.title), 'utf8')
  return convert(original, {codeIndent: '  '})
    .then(actual => t.is(actual, expected))
})

test('logo.4.pug', t => {
  const original = readFileSync(resolve(__dirname, 'fixtures', 'logo.original.svg'), 'utf8')
  const expected = readFileSync(resolve(__dirname, 'fixtures', t.title), 'utf8')
  return convert(original, {codeIndent: '    '})
    .then(actual => t.is(actual, expected))
})

test('coin.4.pug', t => {
  const original = readFileSync(resolve(__dirname, 'fixtures', 'coin.original.svg'), 'utf8')
  const expected = readFileSync(resolve(__dirname, 'fixtures', t.title), 'utf8')
  return convert(original, {codeIndent: '    '})
    .then(actual => t.is(actual, expected))
})

test('all.4.pug', t => {
  const original = [{
    name: 'logo.4',
    svg: readFileSync(resolve(__dirname, 'fixtures', 'logo.original.svg'), 'utf8')
  }, {
    name: 'coin.4',
    svg: readFileSync(resolve(__dirname, 'fixtures', 'coin.original.svg'), 'utf8')
  }]
  return convertAll(original, {codeIndent: '    '})
    .then(actual => Promise.all(actual.map(actual => {
      const expected = readFileSync(resolve(__dirname, 'fixtures', actual.name), 'utf8')
      return t.is(actual.code, expected)
    })))
})

test(t => {
  t.throws(() => convert(''), /codeIndent must be a string/)
  t.throws(() => convert('', {codeIndent: 'x'}), /codeIndent must be whitespace only/)
})
