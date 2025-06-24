package com.musicapp.repository;

import com.musicapp.entity.PlaylistSong;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PlaylistSongRepository extends JpaRepository<PlaylistSong, Long> {
    List<PlaylistSong> findByUserEmail(String userEmail);
    Optional<PlaylistSong> findByUserEmailAndSongId(String userEmail, Long songId);
    void deleteByUserEmailAndSongId(String userEmail, Long songId);
} 