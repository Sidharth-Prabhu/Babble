package com.example.demo.dto;

import com.example.demo.model.Post;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserProfileResponse {
    private String username;
    private String displayName;
    private String email;
    private String bio;
    private String profilePictureUrl;
    private String bannerUrl;
    private LocalDateTime createdAt;
    private LocalDateTime lastSeenAt;
    private List<PostResponse> posts;
    private long totalPosts;
    private long followers;
    private long following;
    private long likes;
}
