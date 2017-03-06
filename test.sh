#!/bin/bash
if [ -e dist/main.js ]; then eval 'node dist/main.js'; else echo 'Please run "gulp build" first before execute this command.'; fi
