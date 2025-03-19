let songs = [];
let currentSongIndex = 0;

const audioPlayer = document.getElementById("audioPlayer");
const songTitle = document.getElementById("songTitle");
const playPauseBtn = document.getElementById("playPauseBtn");
const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");
const progressBar = document.getElementById("progressBar");
const currentTimeDisplay = document.getElementById("currentTime");
const totalTimeDisplay = document.getElementById("totalTime");
const albumArt = document.getElementById("albumArt");
const repeatButton = document.getElementById("repeatButton");
const shuffleButton = document.getElementById("shuffleButton");


// Fetch Songs from MongoDB
async function fetchSongs() {
  try {
    const response = await fetch("http://localhost:3001/songs");
    const fetchedSongs = await response.json(); // Store fetched songs in a temporary variable

    if (!fetchedSongs || fetchedSongs.length === 0) {
      console.warn("⚠️ No songs retrieved from database.");
      return;
    }

    songs = fetchedSongs; // ✅ Only update `songs` if data exists
    console.log("✅ Songs successfully loaded:", songs);

    playlists["All Songs"] = songs; 
    localStorage.setItem("playlists", JSON.stringify(playlists));

    displayPlaylists();
    loadPlaylist("All Songs");

    // ✅ Ensure `loadSong(0)` is only called if songs exist
    if (songs.length > 0) {
      console.log("🎵 Loading first song:", songs[0].title);
      loadSong(0);
    }

  } catch (error) {
    console.error("🚨 Error fetching songs:", error);
  }
};

fetchSongs();

// Load the first song
function loadSong(index) {
  console.log(`🔹 Attempting to load song at index: ${index}`);

  if (!songs || songs.length === 0) {
    console.error("🚨 No songs loaded yet.");
    return;
  }

  const song = songs[index];
  console.log("✅ Song loaded successfully:", song);

  audioPlayer.src = `http://localhost:3001${song.filePath}`; // pulls the actual audio from the backend
  songTitle.textContent = song.title; // displays the song title 

  if (audioPlayer.play) {
    playPauseBtn.textContent = "⏸";
  }

  // ensures anything without album art gets the default image displayed on the player
  let albumArtPath = song.albumArt && song.albumArt.trim() !== ""
    ? song.albumArt
    : "coverArt/default.webp";
  
  console.log("✅ Album Art Path:", albumArtPath);
  albumArt.src = albumArtPath;

  progressBar.value = 0;
  progressBar.max = 100;
};

// Initialize first song
loadSong(currentSongIndex);


// Play and Pause Feature
playPauseBtn.onclick = function () {
  if (audioPlayer.paused) {
    audioPlayer.play();
    playPauseBtn.textContent = "⏸";
  } else {
    audioPlayer.pause();
    playPauseBtn.textContent = "▶️"; 
  }
};

// Next Song
nextBtn.onclick = function () {
  if (isShuffling) {
    let currentIndexInShuffle = shuffledIndexes.indexOf(currentSongIndex);
    let nextIndexInShuffle = (currentIndexInShuffle + 1) % shuffledIndexes.length;
    currentSongIndex = shuffledIndexes[nextIndexInShuffle]; // Pick from shuffled order
} else {
    currentSongIndex = (currentSongIndex + 1) % songs.length; // Normal order
}
  loadSong(currentSongIndex);
  audioPlayer.play();
};

// Previous Song
prevBtn.onclick = function () {
  if (isShuffling) {
    let currentIndexInShuffle = shuffledIndexes.indexOf(currentSongIndex);
    let prevIndexInShuffle = (currentIndexInShuffle - 1 + shuffledIndexes.length) % shuffledIndexes.length;
    currentSongIndex = shuffledIndexes[prevIndexInShuffle]; // Pick from shuffled order
} else {
    currentSongIndex = (currentSongIndex - 1 + songs.length) % songs.length; // Normal order
}
  loadSong(currentSongIndex);
  audioPlayer.play();
};



// Update progress during song
audioPlayer.ontimeupdate = function () {
  const progress = (audioPlayer.currentTime / audioPlayer.duration) * 100;
  progressBar.value = progress;

  const minutes = Math.floor(audioPlayer.currentTime / 60);
  const seconds = Math.floor(audioPlayer.currentTime % 60);
  currentTimeDisplay.textContent = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`
};

// Display total duration once the song loads
audioPlayer.onloadedmetadata = function () {
  progressBar.value = 0;
  const minutes = Math.floor(audioPlayer.duration / 60);
  const seconds = Math.floor(audioPlayer.duration % 60);
  totalTimeDisplay.textContent = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
};

// Move through the song
progressBar.oninput = function () {
  const seekTime = (progressBar.value / 100) * audioPlayer.duration;
  audioPlayer.currentTime = seekTime;
};

// Auto play for next song
audioPlayer.onended = function () {
  if (repeatMode === 2) {
      // Repeat One
      audioPlayer.currentTime = 0;
      audioPlayer.play();
  } else if (repeatMode === 1) {
      // Repeat All
      currentSongIndex = (currentSongIndex + 1) % songs.length;
      loadSong(currentSongIndex);
      audioPlayer.play();
  } else {
      // Normal Mode
      if (currentSongIndex < songs.length - 1) {
          currentSongIndex++;
          loadSong(currentSongIndex);
          audioPlayer.play();
      }
  }
};

// Shuffle Songs
let isShuffling = false;
let shuffledIndexes = [];

function shuffleArray(array) {
  return array
      .map(value => ({ value, sort: Math.random() })) // Assign random values
      .sort((a, b) => a.sort - b.sort) // Sort randomly
      .map(({ value }) => value); // Extract values
};

shuffleButton.onclick = () => {
  isShuffling = !isShuffling; // changes back and forth between true and false when clicked 

  if (isShuffling) {
      shuffledIndexes = shuffleArray([...Array(songs.length).keys()]); // Create shuffled index list
      shuffleButton.classList.add("active"); // can highlight to make it clear shuffle is on
      console.log("🔀 Shuffle ON", shuffledIndexes);
  } else {
      shuffleButton.classList.remove("active"); // removes highlight when off
      console.log("🔀 Shuffle OFF");
  }
};

// Repeat All and Repeat One Button
let repeatMode = 0;

repeatButton.onclick = function () {
  repeatMode = (repeatMode + 1) % 3; // makes it so it cycles through all three stages of the button

  if (repeatMode === 0) {
    repeatButton.classList.remove ("active");
    repeatButton.innerHTML = "🔁";
  } else if (repeatMode === 1){
    repeatButton.classList.add("active");
    repeatButton.innerHTML = "🔁";
  } else if (repeatMode === 2) {
    repeatButton.classList.add("active");
    repeatButton.innerHTML = "🔂"; 
  }
};

