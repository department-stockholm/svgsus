import test from 'ava'
import {readFileSync, writeFileSync} from 'fs'
import {resolve} from 'path'
import {convert, convertAll} from '../lib/cashapelayer'

test('logo.appkit-2.swift', t => {
  const original = readFileSync(resolve(__dirname, 'fixtures', 'logo.original.svg'), 'utf8')
  const expected = readFileSync(resolve(__dirname, 'fixtures', t.title), 'utf8')
  return convert(original, {codeIndent: '  ', codeType: 'AppKit'})
    .then(actual => t.is(actual, expected))
})

test('logo.appkit-4.swift', t => {
  const original = readFileSync(resolve(__dirname, 'fixtures', 'logo.original.svg'), 'utf8')
  const expected = readFileSync(resolve(__dirname, 'fixtures', t.title), 'utf8')
  return convert(original, {codeIndent: '    ', codeType: 'AppKit'})
    .then(actual => t.is(actual, expected))
})

test('logo.uikit-2.swift', t => {
  const original = readFileSync(resolve(__dirname, 'fixtures', 'logo.original.svg'), 'utf8')
  const expected = readFileSync(resolve(__dirname, 'fixtures', t.title), 'utf8')
  return convert(original, {codeIndent: '  ', codeType: 'UIKit'})
    .then(actual => t.is(actual, expected))
})

test('logo.uikit-4.swift', t => {
  const original = readFileSync(resolve(__dirname, 'fixtures', 'logo.original.svg'), 'utf8')
  const expected = readFileSync(resolve(__dirname, 'fixtures', t.title), 'utf8')
  return convert(original, {codeIndent: '    ', codeType: 'UIKit'})
    .then(actual => t.is(actual, expected))
})

test('river.uikit-4.swift', t => {
  const original = readFileSync(resolve(__dirname, 'fixtures', 'river.original.svg'), 'utf8')
  const expected = readFileSync(resolve(__dirname, 'fixtures', t.title), 'utf8')
  return convert(original, {codeIndent: '    ', codeType: 'UIKit'})
    .then(actual => t.is(actual, expected))
})

test('logo.appkit-2-v3.swift', t => {
  const original = readFileSync(resolve(__dirname, 'fixtures', 'logo.original.svg'), 'utf8')
  const expected = readFileSync(resolve(__dirname, 'fixtures', t.title), 'utf8')
  return convert(original, {codeIndent: '  ', codeType: 'AppKit', version: 3})
    .then(actual => t.is(actual, expected))
})
test('logo.uikit-2-v3.swift', t => {
  const original = readFileSync(resolve(__dirname, 'fixtures', 'logo.original.svg'), 'utf8')
  const expected = readFileSync(resolve(__dirname, 'fixtures', t.title), 'utf8')
  return convert(original, {codeIndent: '  ', codeType: 'UIKit', version: 3})
    .then(actual => t.is(actual, expected))
})

test('river.appkit-2-v3.swift', t => {
  const original = readFileSync(resolve(__dirname, 'fixtures', 'river.original.svg'), 'utf8')
  const expected = readFileSync(resolve(__dirname, 'fixtures', t.title), 'utf8')
  return convert(original, {codeIndent: '  ', codeType: 'AppKit', version: 3})
    .then(actual => t.is(actual, expected))
})
test('river.uikit-2-v3.swift', t => {
  const original = readFileSync(resolve(__dirname, 'fixtures', 'river.original.svg'), 'utf8')
  const expected = readFileSync(resolve(__dirname, 'fixtures', t.title), 'utf8')
  return convert(original, {codeIndent: '  ', codeType: 'UIKit', version: 3})
    .then(actual => t.is(actual, expected))
})

test('all.uikit-4.swift', t => {
  const original = [{
    name: 'logo.original.svg',
    svg: readFileSync(resolve(__dirname, 'fixtures', 'logo.original.svg'), 'utf8')
  }, {
    name: 'coin.original.svg',
    svg: readFileSync(resolve(__dirname, 'fixtures', 'coin.original.svg'), 'utf8')
  }]
  const expected = readFileSync(resolve(__dirname, 'fixtures', t.title), 'utf8')
  return convertAll(original, {codeIndent: '    ', codeType: 'UIKit'})
    .then(actual => t.is(actual[0].code, expected))
})

test(t => {
  t.throws(() => convert(''), /codeIndent must be a string/)
  t.throws(() => convert('', {codeIndent: ''}), /codeType must be either "AppKit" or "UIKit"/)
  t.throws(() => convert('', {codeType: ''}), /codeIndent must be a string/)
})
