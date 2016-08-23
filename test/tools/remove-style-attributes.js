import test from 'ava';
import {readFileSync} from 'fs';
import {resolve} from 'path';
import removeStyleAttributes from '../../lib//tools/remove-style-attributes';

test('coin.remove-style-attributes.svg', t => {
  const original = readFileSync(resolve(__dirname, '../fixtures', 'coin.original.svg'), 'utf8');
  const expected = readFileSync(resolve(__dirname, '../fixtures', t.title), 'utf8');
  return removeStyleAttributes(original)
    .then(actual => t.is(actual, expected));
})

test(t => {
  t.throws(() => removeStyleAttributes(true), /svgInput must be a string/);
})
