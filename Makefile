.PHONY: all
.PHONY: flow-stop check check-coverage test lint
.PHONY: assets styles source build package
.PHONY: server clean

LIB_NAME     = tldr

BIN_DIR      = ./node_modules/.bin
BUILD_DIR    = lib
CACHE_DIR    = .cache
COVERAGE_DIR = coverage
DIST_DIR     = dist
PERF_DIR     = src/__tests__/perf
SCRIPT_DIR   = scripts
SRC_DIR      = src
TEST_DIR     = tests

PERF_TESTS = $(shell find $(PERF_DIR) -name "*.perf.js")

DIR = .

BRANCH   ?= $(shell git rev-parse --abbrev-ref HEAD)
VERSION   = $(shell git describe --tags HEAD)
REVISION  = $(shell git rev-parse HEAD)
STAMP     = $(REVISION).$(shell date +%s)

all: setup build lint check test bench

setup: dirs
	$(SCRIPT_DIR)/symlink.sh

.npmignore: .gitignore FORCE
	cat .gitignore | grep -v lib > $@

flow-stop:
	$(BIN_DIR)/flow stop

check:
	$(BIN_DIR)/flow
	$(SCRIPT_DIR)/check-coverage.sh

./tests:
	ln -sf $(SRC_DIR)/__tests__ $(TEST_DIR)

bench: ./tests $(PERF_TESTS) FORCE
$(PERF_DIR)/%.perf.js:
	$(NODE) $@

test:
	NODE_ENV=test $(BIN_DIR)/jest -c .jestrc

lint:
	$(BIN_DIR)/eslint $(SRC_DIR)

build: dirs assets styles source

dirs:
	mkdir -p \
		$(BIN_DIR) \
		$(BUILD_DIR) \
		$(CACHE_DIR) \
		$(COVERAGE_DIR) \
		$(DIST_DIR) \
		$(SRC_DIR)

assets:
	cp -r ./assets $(BUILD_DIR)

styles:
	$(BIN_DIR)/node-sass \
		--source-map true \
		--source-map-embed \
		--source-map-contents \
		--output-style compressed \
		./styles/index.sass > $(BUILD_DIR)/$(LIB_NAME).css

source:
	touch $(CACHE_DIR)/browserify-cache.json
	$(BIN_DIR)/babel $(SRC_DIR) -d lib
	gsed -i '/require/s/zazen/./' lib/**.js
	mv $(CACHE_DIR)/browserify-cache.json browserify-cache.json
	$(BIN_DIR)/browserifyinc \
		lib/index.js \
		--debug \
		--standalone $(LIB_NAME).js \
		-t babelify \
		-t reactify \
		| $(BIN_DIR)/exorcist $(BUILD_DIR)/$(LIB_NAME).map.js \
		> $(BUILD_DIR)/$(LIB_NAME).js
	mv browserify-cache.json $(CACHE_DIR)/browserify-cache.json

package: clean build
	cp -r index.html opensearch.xml $(BUILD_DIR) $(DIST_DIR)
	sed -i 's build/bundle build/$(STAMP) g' $(DIST_DIR)/index.html
	sed -i 's build/index build/$(STAMP) g'  $(DIST_DIR)/index.html
	mv $(DIST_DIR)/$(BUILD_DIR)/index.css $(DIST_DIR)/$(BUILD_DIR)/$(STAMP).css
	$(BIN_DIR)/uglifyjs $(DIST_DIR)/$(BUILD_DIR)/bundle.js > $(DIST_DIR)/$(BUILD_DIR)/$(STAMP).js
	rm $(DIST_DIR)/$(BUILD_DIR)/bundle.js
	gzip -c -9 $(DIST_DIR)/$(BUILD_DIR)/$(STAMP).css > $(DIST_DIR)/$(BUILD_DIR)/$(STAMP).css.gz
	gzip -c -9 $(DIST_DIR)/$(BUILD_DIR)/$(STAMP).js  > $(DIST_DIR)/$(BUILD_DIR)/$(STAMP).js.gz

server:
	$(BIN_DIR)/static-server -n $(DIR)/index.html -f $(DIR)

tags: .ctagsignore
	rm -f tags
	ctags $(SRC_DIR)

.ctagsignore: node_modules
	ls -fd1 node_modules/* > $@

clean:
	rm -rf $(BUILD_DIR) $(DIST_DIR) $(CACHE_DIR) tags

cleanall: clean
	rm -rf node_modules $(COVERAGE_DIR)

FORCE:
