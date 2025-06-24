package project.com.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import project.com.model.JWTManager;
import project.com.model.LikedSong;
import project.com.service.LikedSongService;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/liked-songs")
@CrossOrigin(origins = "*")
public class LikedSongController {

    @Autowired
    private LikedSongService likedSongService;

    @Autowired
    private JWTManager jwtManager;

    @GetMapping
    public ResponseEntity<?> getLikedSongs(@RequestHeader("Authorization") String token) {
        String userEmail = jwtManager.validateToken(token);
        if (userEmail.equals("401")) {
            return ResponseEntity.status(401).body("Invalid or expired token");
        }
        List<LikedSong> likedSongs = likedSongService.getLikedSongs(userEmail);
        return ResponseEntity.ok(likedSongs);
    }

    @PostMapping("/toggle")
    public ResponseEntity<?> toggleLikeSong(
            @RequestHeader("Authorization") String token,
            @RequestBody LikedSong song) {
        String userEmail = jwtManager.validateToken(token);
        if (userEmail.equals("401")) {
            return ResponseEntity.status(401).body("Invalid or expired token");
        }
        boolean isLiked = likedSongService.toggleLikeSong(userEmail, song);
        return ResponseEntity.ok(Map.of("liked", isLiked));
    }

    @GetMapping("/check/{songId}")
    public ResponseEntity<?> isSongLiked(
            @RequestHeader("Authorization") String token,
            @PathVariable Long songId) {
        String userEmail = jwtManager.validateToken(token);
        if (userEmail.equals("401")) {
            return ResponseEntity.status(401).body("Invalid or expired token");
        }
        boolean isLiked = likedSongService.isSongLiked(userEmail, songId);
        return ResponseEntity.ok(Map.of("liked", isLiked));
    }
} 