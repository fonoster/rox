#!/bin/bash
# ACTIVATION_INTENT="bot.activate" \
EVENTS_ENABLED="true" \
WELCOME_INTENT_TRIGGER="hi" \
TTS_ENGINE="google" \
TTS_VOICE="en-US-Wavenet-F" \
INTENTS_ENGINE="dialogflow.cx" \
INTENTS_ENGINE_LOCATION="us-central1" \
INTENTS_ENGINE_AGENT="353dc74a-d0c3-406c-bf6c-7e1585af4ae5" \
ASR_ENGINE="google" \
GOOGLE_CONFIG=$(pwd)/.config/google.json node dist/voice.js