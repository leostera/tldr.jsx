#!/bin/bash

echo "Switching to BuckleScript..."
opam switch 4.02.3+buckle-master

echo "Configuring environment..."
eval `opam config env`

echo "OK! 🐪"
