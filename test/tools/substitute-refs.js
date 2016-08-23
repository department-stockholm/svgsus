import test from 'ava';
import {readFileSync} from 'fs';
import {resolve} from 'path';
import substituteRefs from '../../lib//tools/substitute-refs';

test('logo-defs.substitute-refs.svg', t => {
  const original = readFileSync(resolve(__dirname, '../fixtures', 'logo-defs.original.svg'), 'utf8');
  const expected = readFileSync(resolve(__dirname, '../fixtures', t.title), 'utf8');
  return substituteRefs(original)
    .then(actual => t.is(actual, expected));
})

test(t => {
  t.throws(() => substituteRefs(true), /svgInput must be a string/);
})
