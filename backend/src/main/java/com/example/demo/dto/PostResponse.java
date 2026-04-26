package com.example.demo.dto;

import com.example.demo.model.User;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PostResponse {
    private Long id;
    private String title;
    private String description;
    private String tags;
    private String mediaUrl;
    private String mediaType;
    @com.fasterxml.jackson.annotation.JsonIgnoreProperties({"password", "email", "authorities", "enabled", "accountNonExpired", "accountNonLocked", "credentialsNonExpired", "hibernateLazyInitializer", "handler"})
    private User user;
    private LocalDateTime createdAt;
    private long likesCount;
    private long commentsCount;
    private boolean likedByCurrentUser;
}
