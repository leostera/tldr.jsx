.PHONY: all
.PHONY: flow-stop check check-coverage test lint
.PHONY: assets styles source build package
.PHONY: server clean

DIST_DIR=./dist
BUILD_DIR=./build
BIN_DIR=./node_modules/.bin
SCRIPT_DIR=./scripts

DIR=.

VERSION=$(shell git describe --tags HEAD)
REVISION=$(shell git rev-parse HEAD)
STAMP=$(REVISION).$(shell date +%s)

all: check lint test package

flow-stop:
	$(BIN_DIR)/flow stop

check:
	$(BIN_DIR)/flow

check-coverage:
	$(SCRIPT_DIR)/check-coverage.sh

test:
	$(BIN_DIR)/jest

lint:
	$(BIN_DIR)/eslint ./src

build: assets styles source

assets:
	cp -r ./assets $(BUILD_DIR)

styles:
	sass --sourcemap=inline \
		--update \
		./styles:$(BUILD_DIR)

source:
	browserify . -d \
		-t babelify \
		-t [ envify \
			--VERSION  "$(VERSION)" \
			--REVISION "$(REVISION)" \
			--STAMP    "$(STAMP)" \
			--NODE_ENV "$(NODE_ENV)" \
		] \
		-o $(BUILD_DIR)/_bundle.js
	mv $(BUILD_DIR)/_bundle.js $(BUILD_DIR)/bundle.js

package: clean build
	cp -r index.html opensearch.xml $(BUILD_DIR) $(DIST_DIR)
	sed -i 's build/bundle build/$(STAMP) g' $(DIST_DIR)/index.html
	sed -i 's build/index build/$(STAMP) g'  $(DIST_DIR)/index.html
	mv $(DIST_DIR)/$(BUILD_DIR)/index.css $(DIST_DIR)/$(BUILD_DIR)/$(STAMP).css
	uglifyjs $(DIST_DIR)/$(BUILD_DIR)/bundle.js -o $(DIST_DIR)/$(BUILD_DIR)/$(STAMP).js
	gzip -c -9 $(DIST_DIR)/$(BUILD_DIR)/$(STAMP).css > $(DIST_DIR)/$(BUILD_DIR)/$(STAMP).css.gz
	gzip -c -9 $(DIST_DIR)/$(BUILD_DIR)/$(STAMP).js  > $(DIST_DIR)/$(BUILD_DIR)/$(STAMP).js.gz

release:
	$(SCRIPT_DIR)/release.sh

server:
	$(BIN_DIR)/static-server -n $(DIR)/index.html -f $(DIR)

clean:
	rm -rf $(BUILD_DIR) $(DIST_DIR)
	mkdir -p $(BUILD_DIR) $(DIST_DIR)
