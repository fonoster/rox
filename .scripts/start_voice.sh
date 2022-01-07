#!/bin/bash
EVENTS_ENABLED="true" \
WELCOME_INTENT_TRIGGER="hello" \
TTS_ENGINE="google" \
ASR_ENGINE="google" \
INTENTS_ENGINE="dialogflow.es" \
INTENTS_ENGINE_PLATFORM="TELEPHONY" \
TTS_VOICE="en-US-Wavenet-F" \
OTL_EXPORTER_ZIPKIN_URL="http://localhost:9412/api/v2/spans" \
OTL_EXPORTER_JAEGER_URL="http://localhost:14268/api/traces" \
TRANSFER_MESSAGE="No worries, we are transfering you" \
TRANSFER_MEDIA="beep" \
TRANSFER_MESSAGE_BUSY="Looks like everybody is busy. Try again later." \
TRANSFER_MESSAGE_NOANSWER="No human available at this time. Try again later." \
GOOGLE_CONFIG_FILE=$(pwd)/google.json ./bin/run
