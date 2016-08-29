
![Svgsus Logo](http://www.svgs.us/images/svgsus_og@2x.png)

[![NPM version](https://badge.fury.io/js/svgsus.svg)](https://npmjs.org/package/svgsus) [![Build Status](https://secure.travis-ci.org/department-stockholm/svgsus.svg)](https://travis-ci.org/department-stockholm/svgsus) [![Build Status](https://ci.appveyor.com/api/projects/status/github/department-stockholm/svgsus?branch=master&svg=true)](https://ci.appveyor.com/project/slaskis/svgsus)

## Install

### Command Line

To use svgsus as a command line tool anywhere in your system you simply need
to install globally it using [npm](https://npm.com).

```
npm install -g svgsus
```

### Library

Or if you want to use svgsus as a library in your project you also use npm but
keep it local to your project to make it easier for your fellow developers.

```
npm install --save svgsus
```

### App

There's also the option of installing Svgsus as an App if you're on macOS
(versions for Windows and Linux are planned).

The app, besides providing a GUI for this tool, also has a few more features.
Read all about them on [our website](http://www.svgs.us) and [our medium post](https://medium.com/@DepartmentStockholm/svgsus-tips-tricks-ba2de435fee0#.o193oyj0t).

[![Available on Mac App Store](https://devimages.apple.com.edgekey.net/app-store/marketing/guidelines/mac/images/badge-download-on-the-mac-app-store.svg)](https://itunes.apple.com/en/app/svgsus/id1106867065?l=en&mt=12)


## Usage


### Command Line

```
Svgsus - Organize, clean and transform your SVGs

  Usage: svgsus <format> [options] [--] [<file>...]

    svgsus svg [--codeIndent=<indent> --compressed --output=<dir>] [--] [<file>...]
    svgsus (pug|jade) [--codeIndent=<indent> --output=<dir>] [--] [<file>...]
    svgsus cashapelayer [--codeIndent=<indent> --codeType=<type> --output=<dir>] [--] [<file>...]
    svgsus uibeziershape [--codeType=<type> --output=<dir>] [--] [<file>...]
    svgsus vectordrawable [--codeIndent=<indent> --output=<dir>] [--] [<file>...]
    svgsus -h | --help
    svgsus --version

  Options:
    --compressed           wether the output should have whitespace stripped
    --codeIndent=<indent>  must be whitespace [default: "  "]
    --codeType=<type>      must be either "AppKit" or "UIKit" [default: UIKit]
    --output=<dir>         a directory to write converted files to, defaults to
                           current directory if any <file>s are specified
```

If no files are specified svgsus expects an SVG to be piped in using stdin and
the formatted output will be piped to stdout.


### Library

Svgsus exports a few converters which each take an SVG and (an optional)
options object as arguments.

### Example

A quick example to demonstrate using svgsus as a library. It reads a an SVG file
and generates a cleaned version of it.

```
const fs = require('fs')
const svgsus = require('svgsus')

const svg = fs.readFileSync('example.svg', 'utf8')
const options = {compressed: true}
svgsus.svg(svg, options).then(cleanedSvg => fs.writeFileSync('example-cleaned.svg'))
```

### API

#### `svgsus.svg(svg, options={})`

Optimizes an SVG using [svgo](https://github.com/svg/svgo).

Options:

- `codeIndent` - a string of whitespace to be used for indentation
- `compressed` - whether the output should have its whitespace stripped

#### `svgsus.pug(svg, options={})` or `svgsus.jade(svg, options={})`

Renders the SVG as Pug (formerly known as Jade).

Available Options:

- `codeIndent` - a string of whitespace to be used for indentation

#### `svgsus.cashapelayer(svg, options={})`

Renders the SVG as Swift code suitable for iOS (UIKit) or macOS (AppKit).

Available Options:

- `codeIndent` - a string of whitespace to be used for indentation
- `codeType` - must be either "AppKit" or "UIKit"

#### `svgsus.uibeziershape(svg, options={})`

Renders the SVG as a single merged UIBezierShape in Swift code suitable
for iOS (UIKit) or macOS (AppKit).

Available Options:

- `codeType` - must be either "AppKit" or "UIKit"

#### `svgsus.vectordrawable(svg, options={})`

Renders the SVG as XML code suitable for Android.

Available Options:

- `codeIndent` - a string of whitespace to be used for indentation


## Contribute

Please have a look at our [contribution guidelines](CONTRIBUTING.md).


## Credits

A very special thanks to the all the developers of our beloved dependencies, and to [svg2android](https://github.com/inloop/svg2android) for providing the inspiration and source of the Vector Drawable converter.


With ❤️ by [Department](https://department.se).
