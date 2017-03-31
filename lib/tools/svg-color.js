const onecolor = require("onecolor");

function svgColor(c) {
  let color;
  if (typeof c === "undefined") {
    color = onecolor("rgba(0, 0, 0, 0)");
  } else if (c === "none") {
    color = onecolor("rgba(0, 0, 0, 0)");
  } else {
    color = onecolor(c);
  }

  return {
    alpha: a => a ? color.alpha(a) : color.alpha(),
    none: () => c === "none",
    hex: () => color.hex(),
    uicolor: () =>
      `UIColor(red: ${color.red()}, green: ${color.green()}, blue:${color.blue()}, alpha: ${color.alpha()})`,
    nscolor: () =>
      `NSColor(red: ${color.red()}, green: ${color.green()}, blue:${color.blue()}, alpha: ${color.alpha()})`
  };
}

module.exports = svgColor;
