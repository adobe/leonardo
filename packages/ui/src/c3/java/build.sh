#!/bin/bash
javac \
	-classpath lib/datalib.jar:lib/colt.jar \
	-d bin \
	src/edu/stanford/vis/color/*.java
	