import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [audioSources, setAudioSources] = useState([]);

  useEffect(() => {
    initMediaRecorder();
    getAudio();
  }, []);

  useEffect(() => {}, [isRecording, mediaRecorder, audioSources]);

  const initMediaRecorder = async () => {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: false
      });
      const media = new MediaRecorder(stream);
      setMediaRecorder(media);
      media.addEventListener('dataavailable', async e => {
        const blob = new Blob([e.data], { type: 'audio/mpeg' });
        const url = URL.createObjectURL(blob);
        console.log(url);

        setAudioSources(prev => [...prev, { url, blob }]);
      });
    }

    return;
  };

  const toggleRecording = () => {
    setIsRecording(prev => !prev);
    isRecording ? mediaRecorder.stop() : mediaRecorder.start();
  };

  const handleImageInput = e => {
    e.preventDefault();
  };

  const sendAudio = async audioBlob => {
    console.log(audioBlob);

    const formData = new FormData();
    formData.append('audio', audioBlob, 'audio_clip.mpeg');
    fetch('http://localhost:4000', {
      method: 'POST',
      body: formData
    });
  };

  const getAudio = async () => {
    const fileNames = await (
      await fetch('http://localhost:4000/file_names')
    ).json();
    console.log(fileNames);

    const getFilesPromises = fileNames.map(fileName =>
      fetch(`http://localhost:4000/file/${fileName}`)
    );
    const blobs = await Promise.all(getFilesPromises);
    console.log(blobs);

    blobs.forEach(async b => {
      const blob = await b.blob();
      console.log(blob);

      const url = URL.createObjectURL(blob);
      setAudioSources(prev => [...prev, { url, blob }]);
    });
  };

  function Player({ src }) {
    return (
      <div>
        <audio controls>
          <source src={src.url} type="audio/mpeg" />
        </audio>
        <button
          onClick={() => {
            sendAudio(src.blob);
          }}
        >
          Salvar!
        </button>
      </div>
    );
  }

  return (
    <div className="App">
      {mediaRecorder && (
        <button title="record" onClick={toggleRecording}>
          Gravar
        </button>
      )}
      <br />
      <br />
      <br />
      <form onSubmit={handleImageInput}>
        <label htmlFor="photo">Take a Photo</label>
        <input
          onChange={handleImageInput}
          type="file"
          accept="image/x-png,image/jpeg,image/gif"
          name="photo"
          id="photo"
          hidden={true}
        />
      </form>

      {audioSources.map((audioSrc, i) => (
        <Player key={i} src={audioSrc} />
      ))}
    </div>
  );
}

export default App;
