package project.com.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import project.com.model.JWTManager;
import project.com.model.PlaylistSong;
import project.com.service.PlaylistSongService;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/playlist-songs")
@CrossOrigin(origins = "*")
public class PlaylistSongController {

    @Autowired
    private PlaylistSongService playlistSongService;

    @Autowired
    private JWTManager jwtManager;

    @GetMapping
    public ResponseEntity<?> getPlaylistSongs(@RequestHeader("Authorization") String token) {
        String userEmail = jwtManager.validateToken(token);
        if (userEmail.equals("401")) {
            return ResponseEntity.status(401).body("Invalid or expired token");
        }
        List<PlaylistSong> playlistSongs = playlistSongService.getPlaylistSongs(userEmail);
        return ResponseEntity.ok(playlistSongs);
    }

    @PostMapping("/add")
    public ResponseEntity<?> addToPlaylist(
            @RequestHeader("Authorization") String token,
            @RequestBody PlaylistSong song) {
        String userEmail = jwtManager.validateToken(token);
        if (userEmail.equals("401")) {
            return ResponseEntity.status(401).body("Invalid or expired token");
        }
        boolean added = playlistSongService.addToPlaylist(userEmail, song);
        return ResponseEntity.ok(Map.of("added", added));
    }

    @DeleteMapping("/remove/{songId}")
    public ResponseEntity<?> removeFromPlaylist(
            @RequestHeader("Authorization") String token,
            @PathVariable Long songId) {
        String userEmail = jwtManager.validateToken(token);
        if (userEmail.equals("401")) {
            return ResponseEntity.status(401).body("Invalid or expired token");
        }
        boolean removed = playlistSongService.removeFromPlaylist(userEmail, songId);
        return ResponseEntity.ok(Map.of("removed", removed));
    }

    @GetMapping("/check/{songId}")
    public ResponseEntity<?> isSongInPlaylist(
            @RequestHeader("Authorization") String token,
            @PathVariable Long songId) {
        String userEmail = jwtManager.validateToken(token);
        if (userEmail.equals("401")) {
            return ResponseEntity.status(401).body("Invalid or expired token");
        }
        boolean inPlaylist = playlistSongService.isSongInPlaylist(userEmail, songId);
        return ResponseEntity.ok(Map.of("inPlaylist", inPlaylist));
    }
} 