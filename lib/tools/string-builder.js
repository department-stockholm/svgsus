
function StringBuilder (v) {
  this.s = []
  this.append(v)
};

StringBuilder.prototype.append = function (v) {
  if (v) {
    this.s.push(v)
  }
}

StringBuilder.prototype.appendLine = function (v) {
  if (v) {
    this.s.push(v)
  }
  this.s.push('\r\n')
}

StringBuilder.prototype.appendFormat = function () {
  var p = /({?){([^}]+)}(}?)/g
  var a = arguments
  var v = a[0]
  var o = false
  if (a.length === 2) {
    if (typeof a[1] === 'object' && a[1].constructor !== String) {
      a = a[1]
      o = true
    }
  }
  var s = v.split(p)
  var r = []
  for (var i = 0; i < s.length; i += 4) {
    r.push(s[i])
    if (s.length > i + 3) {
      if (s[i + 1] === '{' && s[i + 3] === '}') {
        r.push(s[i + 1], s[i + 2], s[i + 3])
      } else {
        r.push(s[i + 1], a[o ? s[i + 2] : parseInt(s[i + 2], 10) + 1], s[i + 3])
      }
    }
  }
  this.s.push(r.join(''))
}

StringBuilder.prototype.clear = function () {
  this.s.length = 0
}

StringBuilder.prototype.toString = function () {
  return this.s.length === 0 ? '' : this.s.join('')
}

module.exports = StringBuilder
