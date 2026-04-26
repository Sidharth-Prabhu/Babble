package com.example.demo.service;

import com.example.demo.dto.GlobalSearchResponse;
import com.example.demo.dto.PostResponse;
import com.example.demo.dto.UserSearchResponse;
import com.example.demo.model.User;
import com.example.demo.repository.PostRepository;
import com.example.demo.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SearchService {

    private final UserService userService;
    private final PostService postService;
    private final UserRepository userRepository;
    private final PostRepository postRepository;

    public GlobalSearchResponse globalSearch(String query, User currentUser) {
        List<UserSearchResponse> users = userService.searchUsers(query, currentUser);
        
        List<PostResponse> posts = postRepository.findByTitleContainingIgnoreCaseOrDescriptionContainingIgnoreCaseOrTagsContainingIgnoreCase(query, query, query)
                .stream()
                .map(post -> postService.convertToResponse(post, currentUser))
                .collect(Collectors.toList());

        return GlobalSearchResponse.builder()
                .users(users)
                .posts(posts)
                .build();
    }
}
