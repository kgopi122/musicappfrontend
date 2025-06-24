package project.com.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import project.com.model.PlaylistSong;

import java.util.List;

@Repository
public interface PlaylistSongRepository extends JpaRepository<PlaylistSong, Long> {
    
    @Query("SELECT ps FROM PlaylistSong ps WHERE ps.userEmail = :userEmail")
    List<PlaylistSong> findByUserEmail(@Param("userEmail") String userEmail);
    
    @Query("SELECT COUNT(ps) FROM PlaylistSong ps WHERE ps.userEmail = :userEmail AND ps.songId = :songId")
    int existsByUserEmailAndSongId(@Param("userEmail") String userEmail, @Param("songId") Long songId);
    
    @Query("DELETE FROM PlaylistSong ps WHERE ps.userEmail = :userEmail AND ps.songId = :songId")
    void deleteByUserEmailAndSongId(@Param("userEmail") String userEmail, @Param("songId") Long songId);
} 