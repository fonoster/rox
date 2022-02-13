#!/bin/bash
EVENTS_ENABLED="true" \
WELCOME_INTENT_TRIGGER="WELCOME" \
TTS_ENGINE="google" \
ASR_ENGINE="google" \
INTENTS_ENGINE="dialogflow.es" \
TTS_VOICE="en-US-Wavenet-F" \
OTL_EXPORTER_ZIPKIN_URL="http://localhost:9412/api/v2/spans" \
OTL_EXPORTER_JAEGER_URL="http://localhost:14268/api/traces" \
TRANSFER_MESSAGE="<speak data-intent-id=\"1.0\" data-ui-intent=\"Transfer Message\"><par><media xml:id='a'><speak><s data-class=\"transfer\">Please wait while we transfer you.</s></speak></media><media xml:id=\"speak\" begin=\"a.end-1s\"><audio soundLevel=\"-15dB\" src=\"https://www.kozco.com/tech/organfinale.mp3\"/></media></par></speak>" \
TRANSFER_MESSAGE_BUSY="Looks like everybody is busy. Try again later." \
TRANSFER_MESSAGE_NOANSWER="No human available at this time. Try again later." \
GOOGLE_CONFIG_FILE=$(pwd)/google.json ./bin/run
