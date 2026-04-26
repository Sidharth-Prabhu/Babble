package com.example.demo.service;

import com.example.demo.model.Comment;
import com.example.demo.model.Post;
import com.example.demo.model.User;
import com.example.demo.repository.CommentRepository;
import com.example.demo.repository.PostRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CommentService {
    private final CommentRepository commentRepository;
    private final PostRepository postRepository;

    public Comment addComment(Long postId, String content, User user) {
        Post post = postRepository.findById(postId).orElseThrow();
        Comment comment = Comment.builder()
                .content(content)
                .user(user)
                .post(post)
                .build();
        return commentRepository.save(comment);
    }

    public List<Comment> getCommentsForPost(Long postId) {
        Post post = postRepository.findById(postId).orElseThrow();
        return commentRepository.findByPostOrderByCreatedAtDesc(post);
    }
}
