.PHONY: all check test build package styles flow-stop assets

BUILD_DIR=./build
BIN_DIR=./node_modules/.bin

all: check lint test build package

ci: check lint test

flow-stop:
	$(BIN_DIR)/flow stop

check:
	$(BIN_DIR)/flow

test:
	$(BIN_DIR)/jest

lint:
	$(BIN_DIR)/eslint ./src

assets:
	cp -r ./assets $(BUILD_DIR)

styles:
	sass --update ./styles:$(BUILD_DIR)

build: assets styles
	browserify . -d -t [envify --NODE_ENV local] -o $(BUILD_DIR)/_bundle.js
	mv $(BUILD_DIR)/_bundle.js $(BUILD_DIR)/bundle.js

package: styles
	browserify . -t [envify --NODE_ENV production] | uglifyjs -cm > $(BUILD_DIR)/bundle.js
