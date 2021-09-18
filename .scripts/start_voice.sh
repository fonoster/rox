#!/bin/bash

export ACTIONS=$(pwd)/actions.json 
export GOOGLE_CONFIG=$(pwd)/google.json 
export ROXANNE_CONFIG=$(pwd)/roxanne.json 
node dist/voice.js