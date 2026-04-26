package com.example.demo.service;

import com.example.demo.model.Story;
import com.example.demo.model.User;
import com.example.demo.repository.StoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class StoryService {
    private final StoryRepository storyRepository;
    private final String UPLOAD_DIR = "uploads/";

    public Story createStory(MultipartFile file, User user) throws IOException {
        String contentType = file.getContentType();
        if (contentType == null || (!contentType.startsWith("image/") && !contentType.startsWith("video/"))) {
            throw new IllegalArgumentException("Only photos and videos are allowed");
        }
        
        Path uploadPath = Paths.get(UPLOAD_DIR);
        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }

        String fileName = "story_" + UUID.randomUUID().toString() + "_" + file.getOriginalFilename();
        Path filePath = uploadPath.resolve(fileName);
        Files.copy(file.getInputStream(), filePath);

        String mediaType = (contentType != null && contentType.startsWith("video")) ? "video" : "image";

        Story story = Story.builder()
                .mediaUrl("/" + UPLOAD_DIR + fileName)
                .mediaType(mediaType)
                .user(user)
                .build();

        return storyRepository.save(story);
    }

    public List<Story> getActiveStories() {
        LocalDateTime twentyFourHoursAgo = LocalDateTime.now().minusHours(24);
        return storyRepository.findByCreatedAtAfterOrderByCreatedAtDesc(twentyFourHoursAgo);
    }
}
