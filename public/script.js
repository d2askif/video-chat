const socket = io('/');

const videGrid = document.getElementById('video-grid');
const myVideo = document.createElement('video');
const peers = {};
myVideo.muted = true;
navigator.mediaDevices
  .getUserMedia({
    video: true,
    audio: true,
  })
  .then((stream) => {
    addVideoStream(myVideo, stream);

    myPeer.on('call', (call) => {
      call.answer(stream);
      call.on('stream', (stream) => {
        const video = document.createElement('video');
        addVideoStream(video, stream);
      });
    });
    socket.on('user-connected', function (userId) {
      connectToNewUser(userId, stream);
    });
  });

const myPeer = new Peer(undefined, {
  host: '/',
  port: 3001,
});
socket.on('user-disconnected', (userId) => {
  console.log('user-disconnected', userId);
  if (peers[userId]) {
    peers[userId].close();
  }
});
myPeer.on('open', (userId) => {
  //console.log(id);
  socket.emit('join-room', ROOM_ID, userId);
});

function addVideoStream(video, stream) {
  video.srcObject = stream;
  video.muted = true;
  video.addEventListener('loadedmetadata', () => {
    video.play();
  });
  videGrid.append(video);
}

function connectToNewUser(userId, stream) {
  console.log('user connected', userId, stream);
  const call = myPeer.call(userId, stream);
  const video = document.createElement('video');

  call.on('stream', (stream) => {
    addVideoStream(video, stream);
  });
  call.on('close', () => {
    video.remove();
  });
  peers[userId] = call;
}
