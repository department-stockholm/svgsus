import test from 'ava';
import {readFileSync} from 'fs';
import {resolve} from 'path';
import {convert, convertAll} from '../lib/css-background';

test('logo.4.css', t => {
  const original = readFileSync(resolve(__dirname, 'fixtures', 'logo.original.svg'), 'utf8');
  const expected = readFileSync(resolve(__dirname, 'fixtures', t.title), 'utf8');
  return convert(original, {codeIndent: '    ', compressed: true})
    .then(actual => t.is(actual, expected));
})
test('coin.4.css', t => {
  const original = readFileSync(resolve(__dirname, 'fixtures', 'coin.original.svg'), 'utf8');
  const expected = readFileSync(resolve(__dirname, 'fixtures', t.title), 'utf8');
  return convert(original, {codeIndent: '    ', compressed: true})
    .then(actual => t.is(actual, expected));
})
test('all.4.css', t => {
  const original = [{
    name: 'logo.original.svg',
    svg: readFileSync(resolve(__dirname, 'fixtures', 'logo.original.svg'), 'utf8')
  },{
    name: 'coin.original.svg',
    svg: readFileSync(resolve(__dirname, 'fixtures', 'coin.original.svg'), 'utf8')
  }];
  const expected = readFileSync(resolve(__dirname, 'fixtures', t.title), 'utf8');
  return convertAll(original, {codeIndent: '    ', codeType: 'UIKit'})
    .then(actual => t.is(actual[0].code, expected));
})
