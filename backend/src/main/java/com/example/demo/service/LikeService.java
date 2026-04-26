package com.example.demo.service;

import com.example.demo.model.Like;
import com.example.demo.model.Post;
import com.example.demo.model.User;
import com.example.demo.repository.LikeRepository;
import com.example.demo.repository.PostRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class LikeService {
    private final LikeRepository likeRepository;
    private final PostRepository postRepository;

    public boolean toggleLike(Long postId, User user) {
        Post post = postRepository.findById(postId).orElseThrow();
        Optional<Like> existingLike = likeRepository.findByUserAndPost(user, post);

        if (existingLike.isPresent()) {
            likeRepository.delete(existingLike.get());
            return false; // Unliked
        } else {
            Like like = Like.builder().user(user).post(post).build();
            likeRepository.save(like);
            return true; // Liked
        }
    }
}
