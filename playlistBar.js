// PLAYLIST SECTION

const sidebar = document.getElementById("sidebar");
const togglePlaylist = document.getElementById("togglePlaylist");
const playlistList = document.getElementById("playlistList");
const createPlaylistBtn = document.getElementById("createPlaylistBtn");
const playlistSongsContainer = document.getElementById("playlistSongsContainer");
const playlistSongs = document.getElementById("playlistSongs");
const selectedPlaylistTitle = document.getElementById("selectedPlaylistTitle");

let playlists = JSON.parse(localStorage.getItem("playlists")) || {
  "All Songs": []
};
let currentPlaylist = "All Songs";

// use the playlist button to collapse/open playlist
togglePlaylist.onclick = () => {
  sidebar.classList.toggle("open");
};

// Function to display the songs in a playlist
function displaySongs(songs) {
  songListContainer.innerHTML = ""; // clears existing playlist

  songs.forEach((song, index) => {
    const songElement = document.createElement("div");
    songElement.classList.add("songItem");
    songElement.innerHTML = `
    <img src="${song.albumArt}" class="song-thumbnail">
    <div>
        <h3>${song.title}</h3>
        <p>${song.artist}</p>
    </div>`;

    songElement.onclick = () => {
      currentSongIndex = index;
      loadSong(currentSongIndex);
      audioPlayer.play();
    };

    songListContainer.appendChild(songElement);
  });
}

// Show Playlists in Sidebar
function displayPlaylists() {
  playlistList.innerHTML = "";

  Object.keys(playlists).forEach(playlistName => {
    const playlistElement = document.createElement("li");
    playlistElement.classList.add("playlist-item"); // Add class for styling

    // Create a div container for name & button to align them properly
    const playlistContainer = document.createElement("div");
    playlistContainer.classList.add("playlist-container");

    // Create playlist name
    const playlistText = document.createElement("span");
    playlistText.textContent = `${playlistName}`;
    playlistText.onclick = () => loadPlaylist(playlistName);
    
    // Create delete button (except for "All Songs")
    if (playlistName !== "All Songs") {
      const deleteBtn = document.createElement("button");
      deleteBtn.innerHTML = "❌";
      deleteBtn.classList.add("delete-playlist-btn");
      deleteBtn.onclick = (event) => {
        event.stopPropagation(); // Prevent triggering playlist selection
        deletePlaylist(playlistName);
      };

      playlistContainer.appendChild(playlistText); // Add text first
      playlistContainer.appendChild(deleteBtn);   // Then add delete button
    } else {
      playlistContainer.appendChild(playlistText); // No delete button for "All Songs"
    }

    playlistElement.appendChild(playlistContainer);
    playlistList.appendChild(playlistElement);
  });
}

// Load a Playlist (Show Songs in Sidebar & Main Player)
function loadPlaylist(playlistName) {
  if (currentPlaylist === playlistName && playlistSongsContainer.style.display === "block") {
    console.log(`🔹 Hiding playlist: ${playlistName}`);
    playlistSongsContainer.style.display = "none"; // Hide song list
    return; // Stop function here
  }

  currentPlaylist = playlistName;
  selectedPlaylistTitle.textContent = playlistName;
  playlistSongsContainer.style.display = "block"; // Show the song list
  playlistSongs.innerHTML = ""; // Clear the list

  // Add an "Edit Playlist" button (only if it's not "All Songs")
  let editPlaylistButton = document.getElementById("editPlaylistButton");

  if (!editPlaylistButton) {
    editPlaylistButton = document.createElement("button");
    editPlaylistButton.id = "editPlaylistButton";
    editPlaylistButton.textContent = "Edit Playlist";
    editPlaylistButton.classList.add("edit-playlist-btn");
    selectedPlaylistTitle.insertAdjacentElement("afterend", editPlaylistButton);
  }

  // Show the edit button only for custom playlists
  editPlaylistButton.style.display = playlistName !== "All Songs" ? "block" : "none";

  // Ensure the `openEditPlaylistModal` function exists before calling
  editPlaylistButton.onclick = () => {
    if (typeof openEditPlaylistModal === "function") {
      openEditPlaylistModal(playlistName);
    } else {
      console.error("🚨 `openEditPlaylistModal` is not defined. Ensure `editPlaylist.js` is loaded.");
    }
  };

  // Store songs for filtering
  let currentPlaylistSongs = playlists[playlistName];

  // Function to filter and display songs
  function updateSongList(searchTerm = "") {
    playlistSongs.innerHTML = ""; // Clear the list before updating

    const filteredSongs = currentPlaylistSongs.filter(song =>
      song.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

    filteredSongs.forEach((song) => {
      const songElement = document.createElement("li");
      songElement.textContent = song.title;

      songElement.onclick = () => {
        console.log(`🎯 Clicked on: ${song.title} - Searching in full song list...`);

        // ✅ Ensure filePath comparison is correct
        const originalIndex = songs.findIndex(s => s.filePath.trim() === song.filePath.trim());

        if (originalIndex !== -1) {
          console.log(`✅ Found at index: ${originalIndex}`);
          currentSongIndex = originalIndex;
          loadSong(currentSongIndex);
          audioPlayer.play();
        } else {
          console.error("🚨 Song not found in the full list:", song.filePath);
        }
      };

      playlistSongs.appendChild(songElement);
    });

    console.log("📜 Filtered Songs:", filteredSongs.map(s => s.title)); // Debugging search results
  }

  // Initially load all songs
  updateSongList();

  //  Add search functionality
  document.getElementById("searchInput").oninput = function () {
    updateSongList(this.value);
  };
};


//  Load a Song from a Playlist into the Main Player
function loadSongFromPlaylist(playlistName, index) {
  const song = playlists[playlistName][index];
  document.getElementById("songTitle").textContent = song.title;
  document.getElementById("albumArt").src = song.albumArt || "coverArt/defaultCover.png";
  document.getElementById("audioPlayer").src = `http://localhost:3001${song.filePath}`;
};

// Delete playlist function

function deletePlaylist(playlistName) {
  const confirmDelete = confirm(`Are you sure you want to delete "${playlistName}"?`);
  if (!confirmDelete) return;

  // Remove playlist from `playlists` object
  delete playlists[playlistName];

  // Update local storage
  localStorage.setItem("playlists", JSON.stringify(playlists));

  // Remove playlist from UI
  const playlistElements = playlistList.querySelectorAll("li");
  playlistElements.forEach(element => {
    if (element.textContent.includes(playlistName)) {
      element.remove();
    }
  });

  // Clear songs list if the deleted playlist was selected
  if (currentPlaylist === playlistName) {
    currentPlaylist = "All Songs"; // Reset to default playlist
    playlistSongsContainer.style.display = "none"; // Hide song container
    playlistSongs.innerHTML = ""; // Clear song list
    selectedPlaylistTitle.textContent = ""; // Clear title
  }

  // Refresh Playlist List
  displayPlaylists();
}

// Call Fetch Songs When the Page Loads
fetchSongs();

