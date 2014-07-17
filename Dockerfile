#
# Dockerfile for tsujio/webrtc-bbs
#

#
# Building
#   docker build -t tsujio/webrtc-bbs .
#
# Running
#   docker run -d -p 80:80 tsujio/webrtc-bbs
#
# Access
#   Open "http://<IP address of the docker engine host>" by your browser.
#

FROM ubuntu:latest
MAINTAINER tsujio

RUN apt-get -y update
RUN apt-get -y install git
RUN apt-get -y install nodejs npm

RUN ln -s /usr/bin/nodejs /usr/bin/node
RUN git clone git://github.com/tsujio/webrtc-bbs.git
WORKDIR webrtc-bbs
RUN git submodule init && git submodule update
RUN npm install
RUN npm run-script build
ENV PORT 80

EXPOSE 80

CMD ["node", "./bin/server.js"]
