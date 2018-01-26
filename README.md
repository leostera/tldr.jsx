# tldr.jsx [![Travis-CI](https://api.travis-ci.org/ostera/tldr.jsx.svg)](https://travis-ci.org/ostera/tldr.jsx)
📚 A Reactive web client for [tldr-pages](https://github.com/tldr-pages/tldr). Try it [here](https://tldr.ostera.io).

## Featuring

* `Unique URIs`, to easily share any `tldr-page`!
* `Mobile-first-ish`, to take with you anywhere!
* Fully Reactive, embracing `ES6`, `RxJS`, `FlowType` and `React` for great win!

![tldr.ostera.io on desktop and mobile views](https://s3.amazonaws.com/tldr.ostera.io/screenshot.jpg)

## Roadmap

As [tldr-pages](https://github.com/tldr-pages/tldr) advances, new features can be planned. Some are:

* `Autocompletion`, freeing you from remembering all those command names
* `Search`, letting you search through all the pages and commands content to find what you want

See the [issues page](https://github.com/ostera/tldr.jsx/issues?q=is%3Aopen+is%3Aissue+label%3Aenhancement) for a list of planned enhancements and features.

## Collaboration Setup

It requires a working `node` environment with `npm`, and `make`.

* `make build`, for a development build
* `make test`, to run the test suite
* `make lint`, to lint the source
* `make check`, to type-check everything
* `make package`, to create a distributable package

Serve locally as you wish, I prefer [static-server](https://www.npmjs.com/package/static-server).

#### But what about Y or X and File Watchers!

File Watchers never really manage to work the way you want them to, so I ended up using [ostera/watch](https://github.com/ostera/watch) for auto-building, auto-testing, auto-anything.

## License

See [LICENSE](https://github.com/ostera/pry/blob/master/LICENSE).
