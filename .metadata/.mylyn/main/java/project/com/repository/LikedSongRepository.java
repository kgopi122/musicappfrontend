package project.com.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import project.com.model.LikedSong;

import java.util.List;

@Repository
public interface LikedSongRepository extends JpaRepository<LikedSong, Long> {
    
    @Query("SELECT ls FROM LikedSong ls WHERE ls.userEmail = :userEmail")
    List<LikedSong> findByUserEmail(@Param("userEmail") String userEmail);
    
    @Query("SELECT COUNT(ls) FROM LikedSong ls WHERE ls.userEmail = :userEmail AND ls.songId = :songId")
    int existsByUserEmailAndSongId(@Param("userEmail") String userEmail, @Param("songId") Long songId);
    
    @Query("DELETE FROM LikedSong ls WHERE ls.userEmail = :userEmail AND ls.songId = :songId")
    void deleteByUserEmailAndSongId(@Param("userEmail") String userEmail, @Param("songId") Long songId);
} 