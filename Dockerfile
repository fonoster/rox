FROM fonoster/base
COPY . /scripts
RUN apk add --no-cache --update npm; \
  apk add --no-cache --update curl; \
  npm install; \
  npm run build; \
  ./install.sh
USER fonoster
EXPOSE 3000/tcp
EXPOSE 3001/tcp

HEALTHCHECK CMD curl --fail http://localhost:3000/ping || exit 1
