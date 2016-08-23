
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
    --compressed           wether the output should have whitespace stripped
    --codeIndent=<indent>  must be whitespace [default: "  "]
    --codeType=<type>      must be either "AppKit" or "UIKit" [default: UIKit]
```