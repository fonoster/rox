##
## Build and pack the service
##
FROM fonoster/base as builder

COPY . /scripts
RUN ./install.sh

##
## Runner
##
FROM fonoster/base as runner

COPY --from=builder /scripts/fonoster-* .

RUN apk add --no-cache --update git tini npm nodejs python3 make g++ \
  && npm install -g fonoster-*.tgz \
  && apk del npm git python3 make g++

USER fonoster

EXPOSE 3000/tcp
EXPOSE 3001/tcp

HEALTHCHECK CMD curl --fail http://localhost:3000/ping || exit 1
