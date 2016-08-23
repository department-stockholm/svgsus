import test from 'ava';
import {readFileSync} from 'fs';
import {resolve} from 'path';
import {convert} from '../lib//uibezierpath';

test('logo.appkit-bezier.swift', t => {
  const original = readFileSync(resolve(__dirname, 'fixtures', 'logo.original.svg'), 'utf8');
  const expected = readFileSync(resolve(__dirname, 'fixtures', t.title), 'utf8');
  return convert(original, {codeIndent: '  ', codeType: 'AppKit'})
    .then(actual => t.is(actual, expected));
})

test('logo.uikit-bezier.swift', t => {
  const original = readFileSync(resolve(__dirname, 'fixtures', 'logo.original.svg'), 'utf8');
  const expected = readFileSync(resolve(__dirname, 'fixtures', t.title), 'utf8');
  return convert(original, {codeIndent: '  ', codeType: 'UIKit'})
    .then(actual => t.is(actual, expected));
})

test(t => {
  t.throws(() => convert(''), /codeType must be either "AppKit" or "UIKit"/);
  t.throws(() => convert('', {codeIndent: ''}), /codeType must be either "AppKit" or "UIKit"/);
  t.throws(() => convert('', {codeIndent: '', codeType: 'x'}), /codeType must be either "AppKit" or "UIKit"/);
})