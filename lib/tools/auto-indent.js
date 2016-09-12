const assert = require('assert');

function autoIndent(extension, code, indent) {
  const supportedExtensions = ['.swift'];
  assert(supportedExtensions.indexOf(extension) !== -1, `extension must be either ${supportedExtensions.join(', ')}`);
  assert(typeof code == 'string', 'code must be a string');
  assert(typeof indent == 'string', 'indent must be a string');

  switch(extension) {
    case '.swift':
      return autoIndentBracets(code, indent);
      break;
  }
}

function autoIndentBracets(code, indent) {
  const lines = code.split('\n');
  let indented = '';
  let level = 0;
  function trim(str) {
    return str.replace(/^\s\s*/, '').replace(/\s\s*$/, '');
  }

  function repeat(pattern, count) {
    if (count < 1) return '';
    var result = '';
    while (count > 1) {
        if (count & 1) result += pattern;
        count >>= 1, pattern += pattern;
    }
    return result + pattern;
  }

  lines.forEach(line => {
    level -= line.indexOf('}') >= 0 ? 1 : 0;
    indented += `${repeat(indent, level)}${trim(line)}\n`;
    level += line.indexOf('{') >= 0 ? 1 : 0;
  })
  return indented
}

module.exports = autoIndent;
