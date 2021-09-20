FROM fonoster/base
COPY . /scripts
RUN apk add --no-cache --update npm; \
  npm i \
  npm run build
RUN ./install.sh
USER fonos
EXPOSE 3000/tcp
EXPOSE 3001/tcp

# HEALTHCHECK CMD curl --fail http://localhost:3000/ping || exit 1
