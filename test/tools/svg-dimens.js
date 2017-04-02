import test from 'ava'
import { resolve } from 'path'
import { getDimensionsFromSvgFile } from '../../lib/tools/svg-dimens'

test('logo.original', t => {
  const path = resolve(__dirname, '../fixtures', t.title + '.svg')
  const expected = { x: 0, y: 0, width: 400, height: 400 }
  return getDimensionsFromSvgFile(path)
    .then(dimens => t.deepEqual(dimens, expected))
})

test('river.original', t => {
  const path = resolve(__dirname, '../fixtures', t.title + '.svg')
  const expected = { x: 76, y: -92.6, width: 243, height: 243 }
  return getDimensionsFromSvgFile(path)
    .then(dimens => t.deepEqual(dimens, expected))
})

test('coin.original', t => {
  const path = resolve(__dirname, '../fixtures', t.title + '.svg')
  const expected = { x: 0, y: 0, width: 16, height: 16 }
  return getDimensionsFromSvgFile(path)
    .then(dimens => t.deepEqual(dimens, expected))
})
