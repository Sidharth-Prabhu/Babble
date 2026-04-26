package com.example.demo.controller;

import com.example.demo.dto.UpdateProfileRequest;
import com.example.demo.dto.UserProfileResponse;
import com.example.demo.model.User;
import com.example.demo.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;
    private final com.example.demo.repository.UserRepository userRepository;

    @GetMapping("/profile/{username}")
    public ResponseEntity<UserProfileResponse> getUserProfile(
            @PathVariable String username,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        User currentUser = null;
        if (userDetails != null) {
            currentUser = userRepository.findByUsername(userDetails.getUsername()).orElse(null);
        }
        return ResponseEntity.ok(userService.getUserProfile(username, currentUser));
    }

    @GetMapping("/me")
    public ResponseEntity<UserProfileResponse> getCurrentUser(@AuthenticationPrincipal UserDetails userDetails) {
        User currentUser = userRepository.findByUsername(userDetails.getUsername()).orElseThrow();
        return ResponseEntity.ok(userService.getUserProfile(userDetails.getUsername(), currentUser));
    }

    @PutMapping("/profile")
    public ResponseEntity<?> updateProfile(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody UpdateProfileRequest request
    ) {
        return ResponseEntity.ok(userService.updateProfile(userDetails.getUsername(), request));
    }

    @PostMapping("/profile/image")
    public ResponseEntity<String> uploadProfileImage(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestParam("file") MultipartFile file
    ) throws IOException {
        return ResponseEntity.ok(userService.uploadProfileImage(userDetails.getUsername(), file));
    }

    @PostMapping("/profile/banner")
    public ResponseEntity<String> uploadBannerImage(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestParam("file") MultipartFile file
    ) throws IOException {
        return ResponseEntity.ok(userService.uploadBannerImage(userDetails.getUsername(), file));
    }
}
