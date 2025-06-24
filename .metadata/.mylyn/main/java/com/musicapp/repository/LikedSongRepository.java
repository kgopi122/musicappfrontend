package com.musicapp.repository;

import com.musicapp.entity.LikedSong;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface LikedSongRepository extends JpaRepository<LikedSong, Long> {
    List<LikedSong> findByUserEmail(String userEmail);
    Optional<LikedSong> findByUserEmailAndSongId(String userEmail, Long songId);
    void deleteByUserEmailAndSongId(String userEmail, Long songId);
} 