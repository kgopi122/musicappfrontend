package com.musicapp.controller;

import com.musicapp.entity.PlaylistSong;
import com.musicapp.repository.PlaylistSongRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/playlist-songs")
@CrossOrigin(origins = "*")
public class PlaylistSongController {

    @Autowired
    private PlaylistSongRepository playlistSongRepository;

    @PostMapping("/add")
    public ResponseEntity<?> addToPlaylist(@RequestBody Map<String, Object> payload, @RequestHeader("Authorization") String token) {
        try {
            String userEmail = extractUserEmailFromToken(token);
            Long songId = Long.parseLong(payload.get("songId").toString());
            
            // Check if song is already in playlist
            boolean exists = playlistSongRepository.findByUserEmailAndSongId(userEmail, songId).isPresent();
            
            if (exists) {
                return ResponseEntity.ok(Map.of("added", false, "message", "Song is already in playlist"));
            }
            
            // Add to playlist
            PlaylistSong playlistSong = new PlaylistSong();
            playlistSong.setUserEmail(userEmail);
            playlistSong.setSongId(songId);
            playlistSong.setSongTitle(payload.get("songTitle").toString());
            playlistSong.setArtist(payload.get("artist").toString());
            playlistSong.setMovieName(payload.get("movieName").toString());
            playlistSong.setImageUrl(payload.get("imageUrl").toString());
            playlistSong.setAudioSrc(payload.get("audioSrc").toString());
            
            playlistSongRepository.save(playlistSong);
            return ResponseEntity.ok(Map.of("added", true));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/check/{songId}")
    public ResponseEntity<?> checkPlaylistStatus(@PathVariable Long songId, @RequestHeader("Authorization") String token) {
        try {
            String userEmail = extractUserEmailFromToken(token);
            boolean inPlaylist = playlistSongRepository.findByUserEmailAndSongId(userEmail, songId).isPresent();
            return ResponseEntity.ok(Map.of("inPlaylist", inPlaylist));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    private String extractUserEmailFromToken(String token) {
        // TODO: Implement proper JWT token validation and email extraction
        // For now, return a placeholder
        return "user@example.com";
    }
} 