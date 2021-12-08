#!/bin/bash
# ACTIVATION_INTENT="bot.activate" \
# INTENTS_ENGINE_LOCATION="us-central1" \
# INTENTS_ENGINE_AGENT="353dc74a-d0c3-406c-bf6c-7e1585af4ae5" \
# LANGUAGE_CODE="en_US" \
EVENTS_ENABLED="true" \
WELCOME_INTENT_TRIGGER="helloslang" \
TTS_ENGINE="google" \
ASR_ENGINE="google" \
INTENTS_ENGINE="dialogflow.es" \
TTS_VOICE="en-US-Wavenet-F" \
GOOGLE_CONFIG=$(pwd)/google.json ./bin/run
