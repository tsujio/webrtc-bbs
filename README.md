webrtc-bbs
============

A distributed anonymous BBS over P2P overlay using WebRTC

## Easy Try
### with Node.js
```sh
node bin/server.js
```
Then open `http://localhost` by your WebRTC-supporting browser.

### with Docker
```sh
docker pull tsujio/webrtc-bbs
docker run -d -p 80:80 tsujio/webrtc-bbs
```

Then open `http://<IP address of the docker engine host>` by your WebRTC-supporting browser.

## Deploying to Heroku
Install [the Heroku Toolbelt][toolbelt] and execute the following commands.
```sh
heroku login
heroku create
git push heroku master
```

## Requirements for Users
webrtc-bbs requires WebRTC in order to publish/subscribe BBS contents, 
so users must use a WebRTC-supporting browser.

WebRTC uses STUN/TURN servers for NAT traversal, so users may need
to adjust some proxy settings to access to them.

## References
* [shinGETsu - P2P anonymous BBS](http://shingetsu.info/index.en)

[toolbelt]:https://toolbelt.heroku.com
