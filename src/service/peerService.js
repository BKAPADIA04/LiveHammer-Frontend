class PeerService {
    constructor() {
        this.peer = new RTCPeerConnection({
            iceServers: [
                {
                    urls: [
                        'stun:stun.l.google.com:19302',
                        'stun:stun.l.google.com:5349',
                        // 'stun:stun1.l.google.com:3478',
                        // 'stun:stun1.l.google.com:5349',
                        // 'stun:stun2.l.google.com:19302',
                        // 'stun:stun2.l.google.com:5349',
                        // 'stun:stun3.l.google.com:3478',
                        // 'stun:stun3.l.google.com:5349',
                        // 'stun:stun4.l.google.com:19302',
                        // 'stun:stun4.l.google.com:5349'
                    ]
                }
            ]
        });
    }

    async getOffer() {
        if(this.peer) {
            try {
            const offer = await this.peer.createOffer();
            await this.peer.setLocalDescription(offer);
            return offer;
            } catch (error) {
                console.error(error);
            }
        }
        else {
            console.error('PeerConnection not initialized.');
        }
    }

    async getAnswer(offer) {
        if(this.peer) {
            try {
                await this.peer.setRemoteDescription(offer);
                const ans = await this.peer.createAnswer();
                await this.peer.setLocalDescription(new RTCSessionDescription(ans));
                return ans;
            } catch (error) {
                console.error(error);
            }
        }
        else {
            console.error('PeerConnection not received.');
        }
    }

    async setLocalDescription(ans) {
        if (this.peer) {
          await this.peer.setRemoteDescription(new RTCSessionDescription(ans));
        }
      }
}

const peerServiceInstance = new PeerService();
export default peerServiceInstance;