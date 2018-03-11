.PHONY: all setup build clean cleanall

DIST_DIR  =./dist
SCRIPT_DIR=./scripts

BSB = $(shell which bsb >/dev/null && which bsb)

BRANCH   = $(shell git rev-parse --abbrev-ref HEAD)
VERSION  = $(shell git describe --tags HEAD)
REVISION = $(shell git rev-parse HEAD)
STAMP    = $(REVISION).$(shell date +%s)

all: build

setup:
	$(SCRIPT_DIR)/setup-ocaml-env.sh

build:
	$(BSB)

clean:
	$(BSB) -clean

cleanall:
	$(BSB) -clean-world
