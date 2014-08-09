webrtc-bbs
============

A distributed anonymous BBS over P2P overlay using WebRTC

## Releases
Date       | Version | Important changes |
---------- | ------- | ----------------- |
2014/07/17 | v0.1.0  |                   |

Note that releases of different major versions are not compatible.

The next release v1.0.0 is being developed on master.

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

Alternatively, you can deploy by the [Heroku Button][heroku-button] below.

[![Deploy](https://www.herokucdn.com/deploy/button.png)](https://heroku.com/deploy?template=https://github.com/tsujio/webrtc-bbs)

## Requirements for Users
webrtc-bbs requires WebRTC in order to publish/subscribe BBS contents, 
so users must use a WebRTC-supporting browser.

WebRTC uses STUN/TURN servers for NAT traversal, so users may need
to adjust some proxy settings to access to them.

## References
* [shinGETsu - P2P anonymous BBS](http://shingetsu.info/index.en)

[toolbelt]:https://toolbelt.heroku.com
[heroku-button]:https://blog.heroku.com/archives/2014/8/7/heroku-button
