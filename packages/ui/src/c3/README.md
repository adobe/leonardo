# C3

**C3** (Categorical Color Components) is a JavaScript library for
modeling color naming data. It can be used to create a variety of
applications, including improved color selection, image editing,
or palette analysis tools.

C3 also includes backend components (written in Java) for processing
raw color naming data and producing a compact model of color naming.
The resulting JSON model file is loaded by the client C3 library.

### Browser Support

C3 should work on any browser. However, the included example applications
require a modern browser that supports [SVG](http://www.w3.org/TR/SVG/)
and the Canvas tag. The examples should work on Firefox, Chrome (Chromium),
Safari (WebKit), Opera and IE9.

Note: Chrome has strict permissions for reading files out of the local file
system. Some examples use AJAX which works differently via HTTP instead of local
files. For the best experience, load the C3 examples from your own machine via
HTTP. Any static file web server will work; for example you can run Python's
built-in server:

    python -m SimpleHTTPServer 8888

Once this is running, go to: <http://localhost:8888/examples/>

### Development Setup

This repository should work out of the box if you just want to create
applications using C3. On the other hand, if you want to extend C3 with new
features, fix bugs, or run tests, you'll need to install a few more things.

C3 uses UglifyJS to minimize the resulting JS file. UglifyJS depends on
[Node.js](http://nodejs.org/) and [NPM](http://npmjs.org/). If you are
developing on Mac OS X, an easy way to install Node and NPM is using
[Homebrew](http://mxcl.github.com/homebrew/):

    brew install node
    brew install npm

Next, from the root directory of this repository, install C3's dependencies:

    make install

You can see the list of dependencies in package.json. NPM will install the
packages in the node_modules directory.
