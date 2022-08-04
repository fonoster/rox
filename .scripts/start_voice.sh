#!/bin/bash
OTL_EXPORTER_ZIPKIN_URL="http://localhost:9412/api/v2/spans" \
OTL_EXPORTER_JAEGER_URL="http://localhost:14268/api/traces" \
LOGS_LEVEL=verbose \
EVENTS_SERVER_ENABLED=true ./bin/run
