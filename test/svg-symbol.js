import test from 'ava';
import {readFileSync, writeFileSync} from 'fs';
import {resolve} from 'path';
import {convert, convertAll} from '../lib/svg-symbol';

test('logo.2-symbol.svg', t => {
  const original = readFileSync(resolve(__dirname, 'fixtures', 'logo.original.svg'), 'utf8');
  const expected = readFileSync(resolve(__dirname, 'fixtures', t.title), 'utf8');
  return convert(original, {codeIndent: '    '})
    .then(actual =>   t.is(actual, expected));
})
test('logo.4-symbol.svg', t => {
  const original = readFileSync(resolve(__dirname, 'fixtures', 'logo.original.svg'), 'utf8');
  const expected = readFileSync(resolve(__dirname, 'fixtures', t.title), 'utf8');
  return convert(original, {codeIndent: '    '})
    .then(actual =>   t.is(actual, expected));
})
test('coin.2-symbol.svg', t => {
  const original = readFileSync(resolve(__dirname, 'fixtures', 'coin.original.svg'), 'utf8');
  const expected = readFileSync(resolve(__dirname, 'fixtures', t.title), 'utf8');
  return convert(original, {codeIndent: '    '})
    .then(actual =>   t.is(actual, expected));
})
test('coin.4-symbol.svg', t => {
  const original = readFileSync(resolve(__dirname, 'fixtures', 'coin.original.svg'), 'utf8');
  const expected = readFileSync(resolve(__dirname, 'fixtures', t.title), 'utf8');
  return convert(original, {codeIndent: '    '})
    .then(actual =>   t.is(actual, expected));
})
test('all.4-symbol.svg', t => {
  const original = [{
    name: 'logo.4-symbol',
    svg: readFileSync(resolve(__dirname, 'fixtures', 'logo.original.svg'), 'utf8')
  },{
    name: 'coin.4-symbol',
    svg: readFileSync(resolve(__dirname, 'fixtures', 'coin.original.svg'), 'utf8')
  }];
  const expected = readFileSync(resolve(__dirname, 'fixtures', t.title), 'utf8');
  return convertAll(original, {codeIndent: '    '})
    .then(actual =>  t.is(actual[0].code, expected));
})
test('all.4-symbol-uncompressed.svg', t => {
  const original = [{
    name: 'logo.4-symbol',
    svg: readFileSync(resolve(__dirname, 'fixtures', 'logo.original.svg'), 'utf8')
  },{
    name: 'coin.4-symbol',
    svg: readFileSync(resolve(__dirname, 'fixtures', 'coin.original.svg'), 'utf8')
  }];
  const expected = readFileSync(resolve(__dirname, 'fixtures', t.title), 'utf8');
  return convertAll(original, {codeIndent: '    ', compressed: false})
    .then(actual =>  t.is(actual[0].code, expected));
})
test(t => {
  t.throws(() => convert(''), /codeIndent must be a string/);
  t.throws(() => convert('', {codeIndent : '😱'}), /codeIndent must be whitespace only/);
  t.throws(() => convert('', {codeIndent : '', name : 1}), /name must be a string/);
  t.throws(() => convert('', {codeIndent : '', stripStyle : 1}), /stripStyle must be a boolean/);
  t.throws(() => convert('', {codeIndent : '', compressed : 'compressed'}), /compressed must be a boolean/);
})
