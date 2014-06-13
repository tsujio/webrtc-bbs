webrtc-bbs
============

An Anonymous BBS over P2P network by web browsers using WebRTC.

## Requirements
webrtc-bbs requires [WebRTC](http://www.webrtc.org/), so check if your
browser supports WebRTC.

It also uses [PeerJS](https://github.com/peers/peerjs) library, which
simplifies the use of WebRTC.
PeerJS needs [PeerServer](https://github.com/peers/peerjs-server) to act as signaling
server, so you must run your own PeerServer or use cloud services such as
[PeerServer Cloud](http://peerjs.com/peerserver) or 
[SkyWay](http://nttcom.github.io/skyway/en/). Specify the information 
for connecting to the PeerServer in `require-config.js`.

webrtc-bbs discovers initial peers to join BBS network, so add `--allow_discover`
option when you run a PeerServer.

WebRTC and PeerJS uses STUN/TURN server and PeerServer, so you may need
to adjust some proxy settings to access to them.

## References
* [shinGETsu - P2P anonymous BBS](http://shingetsu.info/index.en)
