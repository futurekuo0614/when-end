
let mediaRecorder;
let audioChunks = [];

document.getElementById('start').onclick = async () => {
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  mediaRecorder = new MediaRecorder(stream);
  mediaRecorder.start(300); // 0.3s slices

  mediaRecorder.ondataavailable = async (e) => {
    audioChunks.push(e.data);
    const blob = new Blob(audioChunks, { type: 'audio/webm' });
    audioChunks = [];

    const arrayBuffer = await blob.arrayBuffer();
    const base64Audio = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));

    const response = await fetch('/api/translate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ audio: base64Audio })
    });
    const data = await response.json();
    const div = document.getElementById('output');
    div.innerHTML += '<p>' + data.translation + '</p>';
  };
};

document.getElementById('stop').onclick = () => {
  if (mediaRecorder && mediaRecorder.state !== 'inactive') {
    mediaRecorder.stop();
  }
};
