FROM fonoster/base
COPY . /scripts
RUN apk add --no-cache --update bash tini nodejs npm python3 make cmake g++; \
  chown -R fonoster /scripts; \
  npm install; \
  npm build; \
  ./install.sh; \
  apk --no-cache add curl
USER fonoster
EXPOSE 3000/tcp
EXPOSE 3001/tcp

HEALTHCHECK CMD curl --fail http://localhost:3000/ping || exit 1