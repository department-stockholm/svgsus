import test from 'ava';
import {execSync} from 'child_process';

test(t => exit(t.title, '', 1))
test('svg', t => exit(t.title, '', 1))
test('svg --compressed', t => exit(t.title, '', 1))
test('svg --compressed', t => exit(t.title, '<svg />', 0))
test('svg --compressed -codeIndent=x', t => exit(t.title, '<svg />', 1))
test('svg --compressed -codeIndent=" "', t => exit(t.title, '<svg />', 0))
test('svg --compressed -codeIndent="\t"', t => exit(t.title, '<svg />', 0))


function exit(args = '', stdin, expected) {
  return new Promise((resolve, reject) => {
    let status = 0
    let message
    try {
      execSync('../bin/svgsus ' + args, {stdio: 'pipe', input: stdin}) // throws if it fails
    } catch(err) {
      status = err.status
      message = err.stderr
    }
    if (status !== expected) {
      reject(new Error(message))
    } else {
      resolve()
    }
  })
}