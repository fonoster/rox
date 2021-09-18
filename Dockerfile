FROM fonoster/base
COPY . /scripts
RUN ./install.sh
USER fonos
EXPOSE 3001/tcp
EXPOSE 3000/tcp

# HEALTHCHECK CMD curl --fail http://localhost:3000/ping || exit 1
