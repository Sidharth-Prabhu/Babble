package com.example.demo.repository;

import com.example.demo.model.Message;
import com.example.demo.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface MessageRepository extends JpaRepository<Message, Long> {
    
    // Find chat history between two users
    @Query("SELECT m FROM Message m WHERE (m.sender = :user1 AND m.recipient = :user2) OR (m.sender = :user2 AND m.recipient = :user1) ORDER BY m.createdAt ASC")
    List<Message> findChatHistory(@Param("user1") User user1, @Param("user2") User user2);

    // Get all messages for a user
    List<Message> findBySenderOrRecipientOrderByCreatedAtDesc(User sender, User recipient);
}
