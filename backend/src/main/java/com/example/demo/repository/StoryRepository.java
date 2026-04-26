package com.example.demo.repository;

import com.example.demo.model.Story;
import org.springframework.data.jpa.repository.JpaRepository;
import java.time.LocalDateTime;
import java.util.List;

public interface StoryRepository extends JpaRepository<Story, Long> {
    List<Story> findByCreatedAtAfterOrderByCreatedAtDesc(LocalDateTime timestamp);
    List<Story> findByUserInAndCreatedAtAfterOrderByCreatedAtDesc(java.util.Collection<com.example.demo.model.User> users, LocalDateTime timestamp);
}
