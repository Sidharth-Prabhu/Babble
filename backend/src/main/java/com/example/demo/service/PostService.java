package com.example.demo.service;

import com.example.demo.model.Post;
import com.example.demo.model.User;
import com.example.demo.repository.PostRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PostService {

    private final PostRepository postRepository;
    private final com.example.demo.repository.LikeRepository likeRepository;
    private final com.example.demo.repository.CommentRepository commentRepository;
    private final String UPLOAD_DIR = "uploads/";

    public Post createPost(String title, String description, String tags, MultipartFile file, User user) throws IOException {
        // ... (rest same as before)
        Path uploadPath = Paths.get(UPLOAD_DIR);
        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }
        String fileName = UUID.randomUUID().toString() + "_" + file.getOriginalFilename();
        Path filePath = uploadPath.resolve(fileName);
        Files.copy(file.getInputStream(), filePath);
        String contentType = file.getContentType();
        String mediaType = (contentType != null && contentType.startsWith("video")) ? "video" : "image";
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

    public java.util.List<com.example.demo.dto.PostResponse> getAllPosts(User currentUser) {
        return postRepository.findAllByOrderByCreatedAtDesc().stream()
                .map(post -> convertToResponse(post, currentUser))
                .collect(java.util.stream.Collectors.toList());
    }

    public com.example.demo.dto.PostResponse convertToResponse(Post post, User currentUser) {
        return com.example.demo.dto.PostResponse.builder()
                .id(post.getId())
                .title(post.getTitle())
                .description(post.getDescription())
                .tags(post.getTags())
                .mediaUrl(post.getMediaUrl())
                .mediaType(post.getMediaType())
                .user(post.getUser())
                .createdAt(post.getCreatedAt())
                .likesCount(likeRepository.countByPost(post))
                .commentsCount(commentRepository.countByPost(post))
                .likedByCurrentUser(currentUser != null && likeRepository.existsByUserAndPost(currentUser, post))
                .build();
    }
}
