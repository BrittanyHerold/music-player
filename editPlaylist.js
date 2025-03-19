const editPlaylistModal = document.getElementById("editPlaylistModal");
const editPlaylistNameInput = document.getElementById("editPlaylistNameInput");
const editSongSelectionList = document.getElementById("editSongSelectionList");
const saveEditPlaylistBtn = document.getElementById("saveEditPlaylistBtn");
const cancelEditPlaylistBtn = document.getElementById("cancelEditPlaylistBtn");

let editingPlaylistName = "";
let editedPlaylistSongs = [];

function openEditPlaylistModal(playlistName) {
  editingPlaylistName = playlistName; // Store the playlist name
  editPlaylistNameInput.value = playlistName; // Show the name in input
  editSongSelectionList.innerHTML = ""; // Clear previous selections
  editPlaylistModal.style.display = "block"; // Show modal

  // Get the current songs in the playlist
  editedPlaylistSongs = playlists[playlistName] ? [...playlists[playlistName]] : [];

  // Display all songs, marking the ones already in the playlist
  songs.forEach((song) => {
    const songItem = document.createElement("div");
    songItem.classList.add("modal-song-item");

    const isInPlaylist = editedPlaylistSongs.some(s => s.filePath === song.filePath);

    songItem.innerHTML = `
      <img src="${song.albumArt || 'coverArt/defaultCover.png'}" class="modal-song-thumbnail">
      <span class="modal-song-title">${song.title}</span>
      <button class="modal-add-remove-song-btn">${isInPlaylist ? "❌" : "➕"}</button>
    `;

    // Handle adding/removing the song
    songItem.querySelector(".modal-add-remove-song-btn").onclick = () => {
      if (isInPlaylist) {
        removeSongFromEditingPlaylist(song, songItem);
      } else {
        addSongToEditingPlaylist(song, songItem);
      }
    };

    editSongSelectionList.appendChild(songItem);
  });
};

function addSongToEditingPlaylist(song, songItem) {
  if (!editedPlaylistSongs.some(s => s.filePath === song.filePath)) {
    editedPlaylistSongs.push(song);
    console.log(`✅ Added "${song.title}" to playlist.`);
    songItem.querySelector(".modal-add-remove-song-btn").textContent = "❌";
  }
};

function removeSongFromEditingPlaylist(song, songItem) {
  editedPlaylistSongs = editedPlaylistSongs.filter(s => s.filePath !== song.filePath);
  console.log(`🗑 Removed "${song.title}" from playlist.`);
  songItem.querySelector(".modal-add-remove-song-btn").textContent = "➕";
};

saveEditPlaylistBtn.onclick = () => {
  if (!editingPlaylistName) return;

  playlists[editingPlaylistName] = editedPlaylistSongs;
  localStorage.setItem("playlists", JSON.stringify(playlists));

  console.log(`💾 Updated playlist: "${editingPlaylistName}"`);

  // Close modal and refresh playlist
  editPlaylistModal.style.display = "none";
  displayPlaylists();
};


