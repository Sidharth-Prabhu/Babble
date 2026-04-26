package com.example.demo.controller;

import com.example.demo.model.Follow;
import com.example.demo.model.User;
import com.example.demo.repository.FollowRepository;
import com.example.demo.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/follows")
@RequiredArgsConstructor
public class FollowController {
    private final FollowRepository followRepository;
    private final UserRepository userRepository;

    @PostMapping("/{username}")
    public ResponseEntity<Map<String, Boolean>> toggleFollow(
            @PathVariable String username,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        User currentUser = userRepository.findByUsername(userDetails.getUsername()).orElseThrow();
        User targetUser = userRepository.findByUsername(username).orElseThrow();

        if (currentUser.getId().equals(targetUser.getId())) {
            return ResponseEntity.badRequest().build();
        }

        var followOpt = followRepository.findByFollowerAndFollowing(currentUser, targetUser);
        boolean isFollowing;
        if (followOpt.isPresent()) {
            followRepository.delete(followOpt.get());
            isFollowing = false;
        } else {
            followRepository.save(Follow.builder()
                    .follower(currentUser)
                    .following(targetUser)
                    .build());
            isFollowing = true;
        }

        return ResponseEntity.ok(Map.of("following", isFollowing));
    }

    @GetMapping("/status/{username}")
    public ResponseEntity<Map<String, Boolean>> getFollowStatus(
            @PathVariable String username,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        User currentUser = userRepository.findByUsername(userDetails.getUsername()).orElseThrow();
        User targetUser = userRepository.findByUsername(username).orElseThrow();
        boolean isFollowing = followRepository.existsByFollowerAndFollowing(currentUser, targetUser);
        return ResponseEntity.ok(Map.of("following", isFollowing));
    }
}
