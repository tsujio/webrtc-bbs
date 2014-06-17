webrtc-bbs
============

An Anonymous BBS over P2P web browsers network using WebRTC.

## Easy Try
If you have a [Docker](http://www.docker.com) environment, it is very easy to try it.

```sh
docker pull tsujio/peerjs-server
docker pull tsujio/webrtc-bbs
docker run -d -p 9000:9000 tsujio/peerjs-server
docker run -d -p 80:80 tsujio/webrtc-bbs
```

Then open `http://<IP address of the docker engine host>` by your WebRTC-supporting browser.

## Hosting webrtc-bbs
There are two things to do if you host a BBS by webrtc-bbs.

1. Run a [PeerServer](https://github.com/peers/peerjs-server)
2. Run a web server such as [apache](http://httpd.apache.org) or [nginx](http://nginx.org) and
publish webrtc-bbs contents

### PeerServer
webrtc-bbs uses [PeerJS](https://github.com/peers/peerjs) library, which
simplifies the use of [WebRTC](http://www.webrtc.org/).
PeerJS needs [PeerServer](https://github.com/peers/peerjs-server) as signaling
server, so you must run your own PeerServer or use cloud services such as
[PeerServer Cloud](http://peerjs.com/peerserver) or 
[SkyWay](http://nttcom.github.io/skyway/en/). Specify the information 
for connecting to the PeerServer in `require-config.js`.

In webrtc-bbs users discover initial peers to join the P2P network from the PeerServer, so add `--allow_discover`
option when you run a PeerServer (If you use cloud services, please inquire the service provider).

### Web Server
All contents of webrtc-bbs is static files, so the task of the web server is only to deliver static files.
It means that no plugin or extension is required to generate dynamic files and it is easy to scale out.

## Requirements for Users
webrtc-bbs requires WebRTC to publish/subscribe BBS contents, so users must use a WebRTC-supporting browser.

WebRTC and PeerJS uses STUN/TURN server and PeerServer, so users may need
to adjust some proxy settings to access to them.

## References
* [shinGETsu - P2P anonymous BBS](http://shingetsu.info/index.en)
