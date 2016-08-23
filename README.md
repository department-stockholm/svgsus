
![Svgsus Logo](http://www.svgs.us/images/svgsus_og@2x.png)


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
npm install -S svgsus
```

### App

There's also the option of installing Svgsus as an App if you're on macOS
(versions for Windows and Linux are planned).

[Available on Mac App Store](https://itunes.apple.com/en/app/svgsus/id1106867065?l=en&mt=12)


## Usage


### Command Line

```
Svgsus - Organize, clean and transform your SVGs

  Usage: svgsus <format> [options] [--] [<file>...]

    svgsus svg [--codeIndent=<indent>] [--compressed] [--] [<file>...]
    svgsus (pug|jade) [--codeIndent=<indent>] [--] [<file>...]
    svgsus cashapelayer [--codeIndent=<indent>] [--codeType=<type>] [--] [<file>...]
    svgsus uibeziershape [--codeType=<type>] [--] [<file>...]
    svgsus vectordrawable [--codeIndent=<indent>] [--] [<file>...]
    svgsus -h | --help
    svgsus --version

  Options:
    --compressed           whether the output should have its whitespace
                           stripped [default: false]
    --codeIndent=<indent>  must be whitespace [default: "  "]
    --codeType=<type>      must be either "AppKit" or "UIKit" [default: UIKit]
```

If no files are specified svgsus expects an SVG to be piped in using stdin. And
if no `--output`-directory is specified svgsus will output to stdout.


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

Renders the SVG as a Java code suitable for Android.

Available Options:

- `codeIndent` - a string of whitespace to be used for indentation


## Contribute

Please have a look at our [contribution guidelines](CONTRIBUTION.md).



With ❤️ by Department.
