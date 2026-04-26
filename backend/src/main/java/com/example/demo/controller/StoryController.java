package com.example.demo.controller;

import com.example.demo.model.Story;
import com.example.demo.model.User;
import com.example.demo.repository.UserRepository;
import com.example.demo.service.StoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/stories")
@RequiredArgsConstructor
public class StoryController {
    private final StoryService storyService;
    private final UserRepository userRepository;

    @PostMapping("/upload")
    public ResponseEntity<Story> uploadStory(
            @RequestParam("file") MultipartFile file,
            @AuthenticationPrincipal UserDetails userDetails
    ) throws IOException {
        User user = userRepository.findByUsername(userDetails.getUsername()).orElseThrow();
        return ResponseEntity.ok(storyService.createStory(file, user));
    }

    @GetMapping
    public ResponseEntity<List<Story>> getStories() {
        return ResponseEntity.ok(storyService.getActiveStories());
    }
}
