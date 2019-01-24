let recorderButton = document.getElementById('recorder-button');
let recorderButtonDiv = document.getElementById('recorder-button-div');
let audioElement = document.getElementById('audio');
let webAudioRecorder;
let currentlyRecording = false;
let getUserMediaStream;

recorderButton.addEventListener('click', () => {
  // the options object determining what media type(s) to capture
  let options = { 'audio': true, 'video': false };
  // only start the recording stream if there is not another recording in progress
  if (currentlyRecording === false) {
    // the built-in method for capturing audio/video from the user's device
    // pass in the media capture options object and ask for permission to access the microphone
    navigator.mediaDevices.getUserMedia(options)
    .then(stream => {

      currentlyRecording = true;
      // if this is a subsequent recording, hide the HTML audio element
      audioElement.controls = false;
      // change the div inside the button so that it looks like a stop button
      recorderButtonDiv.style.backgroundColor = 'rgba(0,0,0,.3)';
      recorderButtonDiv.style.borderRadius = 0;
      // set this to stream so that we can access it outside the scope of the promise 
      // when we need to stop the stream created by getUserMedia 
      getUserMediaStream = stream;
      // the AudioContext that will handle our audio stream
      let audioContext = new AudioContext();
      // an audio node that we can feed to a new WebAudioRecorder so we can record/encode the audio data
      let source = audioContext.createMediaStreamSource(stream);
      // the creation of the recorder with its settings:
      webAudioRecorder = new WebAudioRecorder(source, {
        // workerDir: the directory where the WebAudioRecorder.js file lives
        workerDir: 'web_audio_recorder_js/',
        // encoding: type of encoding for our recording ('mp3', 'ogg', or 'wav')
        encoding: 'mp3',
        options: {
          // encodeAfterRecord: our recording won't be usable unless we set this to true
          encodeAfterRecord: true,
          // mp3: bitRate: '160 is default, 320 is max quality'
          mp3: { bitRate: '320' }
        }
      });
      // the method that fires when the recording finishes (triggered by webAudioRecorder.finishRecording() below)
      // the blob is the encoded audio file
      webAudioRecorder.onComplete = (webAudioRecorder, blob) => {
        // create a temporary URL that we can use as the src attribute for our audio element (audioElement)
        let audioElementSource = window.URL.createObjectURL(blob);
        // set this URL as the src attribute of our audio element
        audioElement.src = audioElementSource;
        // add controls so we can start and pause at will
        audioElement.controls = true;
        // reset the styles of the button's child div to look like a record button
        recorderButtonDiv.style.backgroundColor = 'red';
        recorderButtonDiv.style.borderRadius = '50%';
      }
      // handles and logs any errors that occur during the encoding/recording process
      webAudioRecorder.onError = (webAudioRecorder, err) => {
          console.error(err);
      }
      // method that initializes the recording
      webAudioRecorder.startRecording();
    })
    // catch and log any errors in getUserMedia's promise
    .catch(err => {
        console.error(err);
    });
  }
  else {
    // this finishes things up and calls webAudioRecorder.onComplete
    webAudioRecorder.finishRecording();
    currentlyRecording = false;
  }
});