#!/bin/bash
# ACTIVATION_INTENT="bot.activate" \
# INTENTS_ENGINE_LOCATION="us-central1" \
# INTENTS_ENGINE_AGENT="353dc74a-d0c3-406c-bf6c-7e1585af4ae5" \
# LANGUAGE_CODE="en_US" \
EVENTS_ENABLED="true" \
WELCOME_INTENT_TRIGGER="hello" \
TTS_ENGINE="google" \
ASR_ENGINE="google" \
INTENTS_ENGINE="dialogflow.es" \
INTENTS_ENGINE_PLATFORM="TELEPHONY" \
TTS_VOICE="en-US-Wavenet-F" \
OTL_EXPORTER_ZIPKIN_URL="http://localhost:9412/api/v2/spans" \
OTL_EXPORTER_JAEGER_URL="http://localhost:14268/api/traces" \
INIT_ENDPOINT="https://raw.githubusercontent.com/fonoster/rox/main/init_endpoint_example.json" \
GOOGLE_CONFIG_FILE=$(pwd)/google.json ./bin/run
