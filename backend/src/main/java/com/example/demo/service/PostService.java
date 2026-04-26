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
    private final String UPLOAD_DIR = "uploads/";

    public Post createPost(String title, String description, String tags, MultipartFile file, User user) throws IOException {
        // Ensure upload directory exists
        Path uploadPath = Paths.get(UPLOAD_DIR);
        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }

        // Generate unique filename
        String fileName = UUID.randomUUID().toString() + "_" + file.getOriginalFilename();
        Path filePath = uploadPath.resolve(fileName);
        
        // Save file
        Files.copy(file.getInputStream(), filePath);

        // Determine media type
        String contentType = file.getContentType();
        String mediaType = (contentType != null && contentType.startsWith("video")) ? "video" : "image";

        // Save metadata
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
}
