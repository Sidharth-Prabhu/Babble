package com.example.demo.service;

import com.example.demo.dto.UpdateProfileRequest;
import com.example.demo.dto.UserProfileResponse;
import com.example.demo.model.Post;
import com.example.demo.model.User;
import com.example.demo.repository.FollowRepository;
import com.example.demo.repository.PostRepository;
import com.example.demo.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final PostRepository postRepository;
    private final FollowRepository followRepository;
    private final PostService postService;
    private final String UPLOAD_DIR = "uploads/";

    public UserProfileResponse getUserProfile(String username, User currentUser) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        List<com.example.demo.dto.PostResponse> posts = postRepository.findByUserOrderByCreatedAtDesc(user).stream()
                .map(post -> postService.convertToResponse(post, currentUser))
                .collect(java.util.stream.Collectors.toList());
        
        return UserProfileResponse.builder()
                .username(user.getUsername())
                .displayName(user.getDisplayName() != null ? user.getDisplayName() : user.getUsername())
                .email(user.getEmail())
                .bio(user.getBio())
                .profilePictureUrl(user.getProfilePictureUrl())
                .bannerUrl(user.getBannerUrl())
                .createdAt(user.getCreatedAt())
                .lastSeenAt(user.getLastSeenAt())
                .posts(posts)
                .totalPosts(posts.size())
                .followers(followRepository.countByFollowing(user))
                .following(followRepository.countByFollower(user))
                .likes(posts.stream().mapToLong(com.example.demo.dto.PostResponse::getLikesCount).sum())
                .build();
    }

    public void updateLastSeen(String username) {
        userRepository.findByUsername(username).ifPresent(user -> {
            user.setLastSeenAt(java.time.LocalDateTime.now());
            userRepository.save(user);
        });
    }

    public User updateProfile(String username, UpdateProfileRequest request) {
        User user = userRepository.findByUsername(username).orElseThrow();
        user.setDisplayName(request.getDisplayName());
        user.setBio(request.getBio());
        return userRepository.save(user);
    }

    public String uploadProfileImage(String username, MultipartFile file) throws IOException {
        if (file.getContentType() == null || !file.getContentType().startsWith("image/")) {
            throw new IllegalArgumentException("Only images are allowed for profile pictures");
        }
        String fileName = saveFile(file, "profile_");
        User user = userRepository.findByUsername(username).orElseThrow();
        user.setProfilePictureUrl("/" + UPLOAD_DIR + fileName);
        userRepository.save(user);
        return user.getProfilePictureUrl();
    }

    public String uploadBannerImage(String username, MultipartFile file) throws IOException {
        if (file.getContentType() == null || !file.getContentType().startsWith("image/")) {
            throw new IllegalArgumentException("Only images are allowed for banner pictures");
        }
        String fileName = saveFile(file, "banner_");
        User user = userRepository.findByUsername(username).orElseThrow();
        user.setBannerUrl("/" + UPLOAD_DIR + fileName);
        userRepository.save(user);
        return user.getBannerUrl();
    }

    public List<com.example.demo.dto.UserSearchResponse> searchUsers(String query, User currentUser) {
        return userRepository.findByUsernameContainingIgnoreCaseOrDisplayNameContainingIgnoreCase(query, query).stream()
                .map(user -> com.example.demo.dto.UserSearchResponse.builder()
                        .username(user.getUsername())
                        .displayName(user.getDisplayName() != null ? user.getDisplayName() : user.getUsername())
                        .profilePictureUrl(user.getProfilePictureUrl())
                        .following(currentUser != null && followRepository.existsByFollowerAndFollowing(currentUser, user))
                        .build())
                .collect(java.util.stream.Collectors.toList());
    }

    private String saveFile(MultipartFile file, String prefix) throws IOException {
        Path uploadPath = Paths.get(UPLOAD_DIR);
        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }
        String fileName = prefix + UUID.randomUUID().toString() + "_" + file.getOriginalFilename();
        Path filePath = uploadPath.resolve(fileName);
        Files.copy(file.getInputStream(), filePath);
        return fileName;
    }
}
