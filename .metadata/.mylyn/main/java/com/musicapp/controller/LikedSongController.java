package com.musicapp.controller;

import com.musicapp.entity.LikedSong;
import com.musicapp.repository.LikedSongRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/liked-songs")
@CrossOrigin(origins = "*")
public class LikedSongController {

    @Autowired
    private LikedSongRepository likedSongRepository;

    @PostMapping("/toggle")
    public ResponseEntity<?> toggleLike(@RequestBody Map<String, Object> payload, @RequestHeader("Authorization") String token) {
        try {
            String userEmail = extractUserEmailFromToken(token);
            Long songId = Long.parseLong(payload.get("songId").toString());
            
            // Check if song is already liked
            boolean isLiked = likedSongRepository.findByUserEmailAndSongId(userEmail, songId).isPresent();
            
            if (isLiked) {
                // Remove from liked songs
                likedSongRepository.deleteByUserEmailAndSongId(userEmail, songId);
                return ResponseEntity.ok(Map.of("liked", false));
            } else {
                // Add to liked songs
                LikedSong likedSong = new LikedSong();
                likedSong.setUserEmail(userEmail);
                likedSong.setSongId(songId);
                likedSong.setSongTitle(payload.get("songTitle").toString());
                likedSong.setArtist(payload.get("artist").toString());
                likedSong.setMovieName(payload.get("movieName").toString());
                likedSong.setImageUrl(payload.get("imageUrl").toString());
                likedSong.setAudioSrc(payload.get("audioSrc").toString());
                
                likedSongRepository.save(likedSong);
                return ResponseEntity.ok(Map.of("liked", true));
            }
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/check/{songId}")
    public ResponseEntity<?> checkLikeStatus(@PathVariable Long songId, @RequestHeader("Authorization") String token) {
        try {
            String userEmail = extractUserEmailFromToken(token);
            boolean isLiked = likedSongRepository.findByUserEmailAndSongId(userEmail, songId).isPresent();
            return ResponseEntity.ok(Map.of("liked", isLiked));
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