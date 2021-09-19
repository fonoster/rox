#!/bin/bash

# export ACIVATION_INTENT="bot.activate"
export WELCOME_INTENT="welcome"
export TTS_ENGINE="google"
export ASR_ENGINE="google"
export WATSON_CONFIG=$(pwd)/.config/watson.json 
export GOOGLE_CONFIG=$(pwd)/.config/google.json 
export ROX_CONFIG=$(pwd)/.config/rox.json 
node dist/src/voice.js