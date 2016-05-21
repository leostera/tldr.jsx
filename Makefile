.PHONY: all check test build package

BUILD_DIR=./.build
BIN_DIR=./node_modules/.bin

all: check test build package

check:
	$(BIN_DIR)/flow

test:
	$(BIN_DIR)/jest

styles:
	sass --update ./styles:$(BUILD_DIR)

build: styles
	browserify . -t [envify --NODE_ENV local]

package: styles
	browserify . -t [envify --NODE_ENV production] | uglifyjs -cm > $(BUILD_DIR)/bundle.js
