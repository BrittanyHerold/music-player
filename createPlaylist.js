// CREATE NEW PLAYLIST FUNCTIONALITy
document.addEventListener("DOMContentLoaded", () => {
  const createPlaylistBtn = document.getElementById("createPlaylistBtn");
  if (!createPlaylistBtn) {
      console.error("🚨 createPlaylistBtn not found in the DOM!");
      return; // Stop execution if button is missing
  }

  createPlaylistBtn.onclick = () => {
      console.log("🎵 Create Playlist button clicked!"); // Debugging log
      playlistNameInput.value = ""; // Reset input field
      songSelectionList.innerHTML = ""; // Clear previous selections
      playlistModal.style.display = "block"; // Show modal
      document.querySelector(".player").style.display = "none";
      sidebar.classList.remove("open");

      updateModalSongList(); // Populate song selection
  };
});

// Search Functionality for Create Playlist Modal
const searchSongsInput = document.getElementById("searchSongs");
searchSongsInput.oninput = function () {
  updateModalSongList(this.value); // Filters songs in modal
};

// Function to filter and display songs in the modal
function updateModalSongList(searchTerm = "") {
  songSelectionList.innerHTML = ""; // Clear the list before updating

  const filteredSongs = songs.filter(song =>
    song.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  filteredSongs.forEach((song) => {
    const songItem = document.createElement("div");
    songItem.classList.add("modal-song-item");

    songItem.innerHTML = `
      <img src="${song.albumArt || 'coverArt/defaultCover.png'}" class="modal-song-thumbnail">
      <span class="modal-song-title">${song.title}</span>
      <button class="modal-add-song-btn">➕</button>
    `;

    // Handle adding the song when clicking ➕
    songItem.querySelector(".modal-add-song-btn").onclick = () => {
      addSongToNewPlaylist(song);
    };

    songSelectionList.appendChild(songItem);
  });
};

// Function to Add Song to New Playlist (Before Saving)
let newPlaylistSongs = []; // Store selected songs

function addSongToNewPlaylist(song) {
  if (!newPlaylistSongs.some(s => s.filePath === song.filePath)) {
    newPlaylistSongs.push(song);
    console.log(`✅ Added "${song.title}" to new playlist.`);
  } else {
    console.log(`⚠️ "${song.title}" is already selected.`);
  }
};

// Close modal (on cancel or "X")
closeModalBtn.onclick = cancelPlaylistBtn.onclick = () => {
  playlistModal.style.display = "none";
  document.querySelector(".player").style.display = "block";
  sidebar.classList.add("open");
};


// Save Playlist
savePlaylistBtn.onclick = () => {
  const playlistName = playlistNameInput.value.trim();
  
  if (!playlistName) {
    alert("Enter a valid playlist name.");
    return;
  }

  // If the playlist already exists, update it instead of creating a new one
  if (playlists[playlistName]) {
    playlists[playlistName] = [...newPlaylistSongs]; // Update existing playlist
  } else {
    playlists[playlistName] = [...newPlaylistSongs]; // Create new playlist
  }

  // Save to localStorage
  localStorage.setItem("playlists", JSON.stringify(playlists));

  // Update playlist sidebar UI
  displayPlaylists();

  // Close modal and reopen music player
  playlistModal.style.display = "none";
  document.querySelector(".player").style.display = "block";
};





