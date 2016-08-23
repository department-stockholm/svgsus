import test from 'ava';
import {readFileSync} from 'fs';
import {resolve} from 'path';
import inlineStyle from '../../lib//tools/inline-style';

test('river.inline-style.svg', t => {
  const expected = readFileSync(resolve(__dirname, '../fixtures', t.title), 'utf8');
  const original = readFileSync(resolve(__dirname, '../fixtures', 'river.original.svg'), 'utf8');
  return inlineStyle(original)
    .then(actual => t.is(actual, expected));
})
