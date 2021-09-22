#!/bin/bash
# ACTIVATION_INTENT="bot.activate" \
EVENTS_ENABLED="true" \
WELCOME_INTENT="welcome" \
TTS_ENGINE="google" \
TTS_VOICE="en-US-Wavenet-F" \
ASR_ENGINE="google" \
GOOGLE_CONFIG=$(pwd)/.config/google.json \
ROX_CONFIG=$(pwd)/.config/rox.json node dist/voice.js