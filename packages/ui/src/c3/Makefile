# See the README for installation instructions.

NODE_PATH ?= ./node_modules
JS_COMPILER = $(NODE_PATH)/uglify-js/bin/uglifyjs

JS_FILES = \
	c3.js

all: \
	$(JS_FILES) \
	$(JS_FILES:.js=.min.js) \
	package.json

c3.js: \
	src/start.js \
	src/c3/def.js \
	src/c3/load.js \
	src/c3/init.js \
	src/c3/api.js \
	src/end.js

%.min.js: %.js Makefile
	@rm -f $@
	$(JS_COMPILER) < $< > $@

c3.%: Makefile
	@rm -f $@
	cat $(filter %.js,$^) > $@
	@chmod a-w $@

install:
	mkdir -p node_modules
	npm install

package.json: c3.js src/package.js
	node src/package.js > $@

clean:
	rm -f c3*.js
