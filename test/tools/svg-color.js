import test from 'ava'
import svgColor from '../../lib/tools/svg-color'

test('svg-color-none', t => {
  t.is(svgColor('none').alpha(), 0)
})

test('svg-color-undefined', t => {
  t.is(svgColor().hex(), '#000000')
})

test('svg-color-value', t => {
  t.is(svgColor('#ff0000').hex(), '#ff0000')
})
