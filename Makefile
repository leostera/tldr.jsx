.PHONY: all check test build package styles flow-stop

BUILD_DIR=./build
BIN_DIR=./node_modules/.bin

all: check test build package

flow-stop:
	$(BIN_DIR)/flow stop

check:
	$(BIN_DIR)/flow

test:
	$(BIN_DIR)/jest

styles:
	sass --update ./styles:$(BUILD_DIR)

build: styles
	browserify . -d -t [envify --NODE_ENV local] -o $(BUILD_DIR)/_bundle.js
	mv $(BUILD_DIR)/_bundle.js $(BUILD_DIR)/bundle.js

package: styles
	browserify . -t [envify --NODE_ENV production] | uglifyjs -cm > $(BUILD_DIR)/bundle.js
