package project.com.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import project.com.model.PlaylistSong;
import project.com.repository.PlaylistSongRepository;

import java.util.List;

@Service
public class PlaylistSongService {

    @Autowired
    private PlaylistSongRepository playlistSongRepository;

    public List<PlaylistSong> getPlaylistSongs(String userEmail) {
        return playlistSongRepository.findByUserEmail(userEmail);
    }

    public boolean addToPlaylist(String userEmail, PlaylistSong song) {
        int exists = playlistSongRepository.existsByUserEmailAndSongId(userEmail, song.getSongId());
        
        if (exists > 0) {
            // Song is already in playlist
            return false;
        } else {
            // Add song to playlist
            song.setUserEmail(userEmail);
            playlistSongRepository.save(song);
            return true;
        }
    }

    public boolean removeFromPlaylist(String userEmail, Long songId) {
        int exists = playlistSongRepository.existsByUserEmailAndSongId(userEmail, songId);
        
        if (exists > 0) {
            playlistSongRepository.deleteByUserEmailAndSongId(userEmail, songId);
            return true;
        }
        return false;
    }

    public boolean isSongInPlaylist(String userEmail, Long songId) {
        return playlistSongRepository.existsByUserEmailAndSongId(userEmail, songId) > 0;
    }
} 