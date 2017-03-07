#!/bin/bash
if [ -e dist/main.js ]; then eval 'node test.js'; else echo 'Please run "gulp build" first before execute this command.'; fi
