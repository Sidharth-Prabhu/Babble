package com.example.demo.service;

import com.example.demo.dto.PostResponse;
import com.example.demo.model.Post;
import com.example.demo.model.User;
import com.example.demo.repository.FollowRepository;
import com.example.demo.repository.PostRepository;
import com.example.demo.repository.LikeRepository;
import com.example.demo.repository.CommentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PostService {

    private final PostRepository postRepository;
    private final LikeRepository likeRepository;
    private final CommentRepository commentRepository;
    private final FollowRepository followRepository;
    private final String UPLOAD_DIR = "uploads/";

    @Transactional
    public Post createPost(String title, String description, String tags, MultipartFile file, User user) throws IOException {
        String contentType = file.getContentType();
        if (contentType == null || (!contentType.startsWith("image/") && !contentType.startsWith("video/"))) {
            throw new IllegalArgumentException("Only photos and videos allowed");
        }
        
        Path uploadPath = Paths.get(UPLOAD_DIR);
        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }
        String fileName = UUID.randomUUID().toString() + "_" + file.getOriginalFilename();
        Path filePath = uploadPath.resolve(fileName);
        Files.copy(file.getInputStream(), filePath);
        
        String mediaType = contentType.startsWith("video") ? "video" : "image";
        Post post = Post.builder()
                .title(title)
                .description(description)
                .tags(tags)
                .mediaUrl("/" + UPLOAD_DIR + fileName)
                .mediaType(mediaType)
                .user(user)
                .build();
        return postRepository.save(post);
    }

    @Transactional(readOnly = true)
    public List<PostResponse> getAllPosts(User currentUser) {
        return postRepository.findAllByOrderByCreatedAtDesc().stream()
                .map(post -> convertToResponse(post, currentUser))
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<PostResponse> getFollowingPosts(User currentUser) {
        if (currentUser == null) return List.of();
        List<User> following = followRepository.findByFollower(currentUser).stream()
                .map(com.example.demo.model.Follow::getFollowing)
                .collect(Collectors.toList());
        
        // Also include current user's own posts in their following feed? 
        // Usually, yes, or just followed people. Let's stick to followed people.
        if (following.isEmpty()) return List.of();
        
        return postRepository.findByUserInOrderByCreatedAtDesc(following).stream()
                .map(post -> convertToResponse(post, currentUser))
                .collect(Collectors.toList());
    }

    public PostResponse convertToResponse(Post post, User currentUser) {
        return PostResponse.builder()
                .id(post.getId())
                .title(post.getTitle())
                .description(post.getDescription())
                .tags(post.getTags())
                .mediaUrl(post.getMediaUrl())
                .mediaType(post.getMediaType())
                .user(post.getUser()) // PostResponse still has @JsonIgnoreProperties on this field
                .createdAt(post.getCreatedAt())
                .likesCount(likeRepository.countByPostId(post.getId()))
                .commentsCount(commentRepository.countByPostId(post.getId()))
                .likedByCurrentUser(currentUser != null && likeRepository.existsByUserIdAndPostId(currentUser.getId(), post.getId()))
                .build();
    }
}
