package project.com.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import project.com.model.LikedSong;
import project.com.repository.LikedSongRepository;

import java.util.List;

@Service
public class LikedSongService {

    @Autowired
    private LikedSongRepository likedSongRepository;

    public List<LikedSong> getLikedSongs(String userEmail) {
        return likedSongRepository.findByUserEmail(userEmail);
    }

    public boolean toggleLikeSong(String userEmail, LikedSong song) {
        int exists = likedSongRepository.existsByUserEmailAndSongId(userEmail, song.getSongId());
        
        if (exists > 0) {
            // Song is already liked, so unlike it
            likedSongRepository.deleteByUserEmailAndSongId(userEmail, song.getSongId());
            return false;
        } else {
            // Song is not liked, so like it
            song.setUserEmail(userEmail);
            likedSongRepository.save(song);
            return true;
        }
    }

    public boolean isSongLiked(String userEmail, Long songId) {
        return likedSongRepository.existsByUserEmailAndSongId(userEmail, songId) > 0;
    }
} 