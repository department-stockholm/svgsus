import test from 'ava'
import {readFileSync} from 'fs'
import {resolve} from 'path'
import pdfToSvg from '../../lib/tools/pdf-to-svg'
import optimizeSvg from '../../lib/tools/optimize-svg'

test('oval-preview-export', t => {
  const original = readFileSync(resolve(__dirname, '../fixtures', t.title + '.pdf'))
  const expected = readFileSync(resolve(__dirname, '../fixtures', t.title + '.svg'), 'utf8')
  return pdfToSvg(original)
    .then(actual => t.is(expected, actual))
})

test('oval-sketch-export', t => {
  const original = readFileSync(resolve(__dirname, '../fixtures', t.title + '.pdf'))
  const expected = readFileSync(resolve(__dirname, '../fixtures', t.title + '.svg'), 'utf8')
  return pdfToSvg(original)
    .then(actual => t.is(expected, actual))
})

test('oval-sketch-export optimized', t => {
  const original = readFileSync(resolve(__dirname, '../fixtures', 'oval-sketch-export.pdf'))
  const expected = readFileSync(resolve(__dirname, '../fixtures', 'oval-sketch-export-optimized.svg'), 'utf8')
  return pdfToSvg(original)
    .then(svg => optimizeSvg(svg))
    .then(actual => t.is(expected, actual))
})

