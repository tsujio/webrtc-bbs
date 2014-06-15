#
# Dockerfile for tsujio/webrtc-bbs
#

#
# Building
#   docker build -t tsujio/webrtc-bbs .
#
# Running
#   docker run -d -p 10080:80 tsujio/webrtc-bbs
#
# Access
#   Open "<IP address of the docker engine host>:10080" by your browser.
#

FROM ubuntu:latest
MAINTAINER tsujio

RUN apt-get -y update
RUN apt-get -y install git
RUN apt-get -y install nodejs npm
RUN apt-get -y install apache2
RUN npm install -g requirejs

ENV APACHE_RUN_USER www-data
ENV APACHE_RUN_GROUP www-data
ENV APACHE_PID_FILE /var/run/apache2.pid
ENV APACHE_RUN_DIR /var/run/apache2
ENV APACHE_LOG_DIR /var/log/apache2
ENV APACHE_LOCK_DIR /var/lock/apache2

RUN rm -rf /var/www/html
RUN cd /var/www && git clone git://github.com/tsujio/webrtc-bbs.git html
RUN cd /var/www/html && git submodule init && git submodule update
RUN ln -s /usr/bin/nodejs /usr/bin/node
RUN r.js -o /var/www/html/lib/webrtc-chord/bin/build.js
RUN chown -R www-data:www-data /var/www/html
RUN service apache2 restart

EXPOSE 80

CMD ["/usr/sbin/apache2", "-D", "FOREGROUND"]
