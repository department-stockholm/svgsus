import test from 'ava';
import {readFileSync} from 'fs';
import {resolve} from 'path';
import removeInvisiblePaths from '../../lib//tools/remove-invisible-paths';

test('coin.remove-invisible-paths.svg', t => {
  const original = readFileSync(resolve(__dirname, '../fixtures', 'coin.original.svg'), 'utf8');
  const expected = readFileSync(resolve(__dirname, '../fixtures', t.title), 'utf8');
  return removeInvisiblePaths(original)
    .then(actual => t.is(actual, expected));
})

test(t => {
  t.throws(() => removeInvisiblePaths(true), /svgInput must be a string/);
})
