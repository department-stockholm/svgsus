import test from 'ava';
import {readFileSync} from 'fs';
import {resolve} from 'path';
import {convert, convertAll} from '../lib//cleaned-svg';

test('logo.cleaned-compressed.svg', t => {
  const original = readFileSync(resolve(__dirname, 'fixtures', 'logo.original.svg'), 'utf8');
  const expected = readFileSync(resolve(__dirname, 'fixtures', t.title), 'utf8');
  return convert(original, {codeIndent: '', compressed: true})
    .then(actual => t.is(actual, expected));
})

test('logo.cleaned-2-uncompressed.svg', t => {
  const original = readFileSync(resolve(__dirname, 'fixtures', 'logo.original.svg'), 'utf8');
  const expected = readFileSync(resolve(__dirname, 'fixtures', t.title), 'utf8');
  return convert(original, {codeIndent: '  ', compressed: false})
    .then(actual => t.is(actual, expected));
})

test('logo.cleaned-4-uncompressed.svg', t => {
  const original = readFileSync(resolve(__dirname, 'fixtures', 'logo.original.svg'), 'utf8');
  const expected = readFileSync(resolve(__dirname, 'fixtures', t.title), 'utf8');
  return convert(original, {codeIndent: '    ', compressed: false})
    .then(actual => t.is(actual, expected));
})
test('coin.cleaned-4-uncompressed.svg', t => {
  const original = readFileSync(resolve(__dirname, 'fixtures', 'coin.original.svg'), 'utf8');
  const expected = readFileSync(resolve(__dirname, 'fixtures', t.title), 'utf8');
  return convert(original, {codeIndent: '    ', compressed: false})
    .then(actual => t.is(actual, expected));
})

test('all.cleaned-4-uncompressed.svg', t => {
  const original = [{
    name: 'logo.cleaned-4-uncompressed',
    svg: readFileSync(resolve(__dirname, 'fixtures', 'logo.original.svg'), 'utf8')
  },{
    name: 'coin.cleaned-4-uncompressed',
    svg: readFileSync(resolve(__dirname, 'fixtures', 'coin.original.svg'), 'utf8')
  }];
  return convertAll(original, {codeIndent: '    ', compressed: false})
    .then(actual =>  Promise.all(actual.map(actual => {
        const expected = readFileSync(resolve(__dirname, 'fixtures', actual.name), 'utf8');
        return t.is(actual.code, expected);
    })));
})

test(t => {
  t.throws(() => convert(''), /codeIndent must be a string/);
  t.throws(() => convert('', {codeIndent: ''}), /compressed must be a boolean/);
  t.throws(() => convert('', {compressed: ''}), /codeIndent must be a string/);
})
