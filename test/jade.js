import test from 'ava';
import {readFileSync} from 'fs';
import {resolve} from 'path';
import {convert} from '../lib//jade';

test('logo.2.jade', t => {
  const original = readFileSync(resolve(__dirname, 'fixtures', 'logo.original.svg'), 'utf8');
  const expected = readFileSync(resolve(__dirname, 'fixtures', t.title), 'utf8');
  return convert(original, {codeIndent: '  '})
    .then(actual => t.is(actual, expected));
})

test('logo.4.jade', t => {
  const original = readFileSync(resolve(__dirname, 'fixtures', 'logo.original.svg'), 'utf8');
  const expected = readFileSync(resolve(__dirname, 'fixtures', t.title), 'utf8');
  return convert(original, {codeIndent: '    '})
    .then(actual => t.is(actual, expected));
})

test(t => {
  t.throws(() => convert(''), /codeIndent must be a string/);
  t.throws(() => convert('', {codeIndent: 'x'}), /codeIndent must be whitespace only/);
})