package com.example.demo.service;

import com.example.demo.dto.CommentResponse;
import com.example.demo.model.Comment;
import com.example.demo.model.Post;
import com.example.demo.model.User;
import com.example.demo.repository.CommentRepository;
import com.example.demo.repository.PostRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CommentService {
    private final CommentRepository commentRepository;
    private final PostRepository postRepository;

    @Transactional
    public CommentResponse addComment(Long postId, String content, User user) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("Post not found"));
        
        Comment comment = Comment.builder()
                .content(content)
                .user(user)
                .post(post)
                .edited(false)
                .build();
        
        return convertToResponse(commentRepository.save(comment));
    }

    @Transactional
    public CommentResponse updateComment(Long commentId, String content, User user) {
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new RuntimeException("Comment not found"));
        
        if (!comment.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Unauthorized");
        }
        
        comment.setContent(content);
        comment.setEdited(true);
        return convertToResponse(commentRepository.save(comment));
    }

    @Transactional
    public void deleteComment(Long commentId, User user) {
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new RuntimeException("Comment not found"));
        
        if (!comment.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Unauthorized");
        }
        commentRepository.delete(comment);
    }

    @Transactional(readOnly = true)
    public List<CommentResponse> getCommentsForPost(Long postId) {
        return commentRepository.findByPost_IdOrderByCreatedAtDesc(postId).stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    private CommentResponse convertToResponse(Comment comment) {
        User user = comment.getUser();
        return CommentResponse.builder()
                .id(comment.getId())
                .content(comment.getContent())
                .username(user != null ? user.getUsername() : "anonymous")
                .displayName(user != null ? (user.getDisplayName() != null ? user.getDisplayName() : user.getUsername()) : "User")
                .profilePictureUrl(user != null ? user.getProfilePictureUrl() : null)
                .createdAt(comment.getCreatedAt())
                .edited(comment.getEdited() != null && comment.getEdited())
                .build();
    }
}
