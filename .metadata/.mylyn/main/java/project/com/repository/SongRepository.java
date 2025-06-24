package project.com.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import project.com.model.Song;

@Repository
public interface SongRepository extends JpaRepository<Song, Long> {
}
