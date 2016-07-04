.PHONY: all flow-stop check check-coverage test lint assets styles build package server

DIST_DIR=./dist
BUILD_DIR=./build
BIN_DIR=./node_modules/.bin
SCRIPT_DIR=./scripts

VERSION="$(shell git describe --tags HEAD)"
REVISION="$(shell git rev-parse HEAD)"

all: check lint test build package

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

assets:
	cp -r ./assets $(BUILD_DIR)

styles:
	sass --update ./styles:$(BUILD_DIR)

build: assets styles
	browserify . -d -t babelify -t [ envify --VERSION $(VERSION) --REVISION $(REVISION) ] -o $(BUILD_DIR)/_bundle.js
	mv $(BUILD_DIR)/_bundle.js $(BUILD_DIR)/bundle.js

package: assets styles
	NODE_ENV=production browserify . | uglifyjs -cm > $(BUILD_DIR)/bundle.js
	mkdir -p $(DIST_DIR)
	cp -r index.html opensearch.xml $(BUILD_DIR) $(DIST_DIR)

server:
	$(BIN_DIR)/static-server -n index.html -f .
