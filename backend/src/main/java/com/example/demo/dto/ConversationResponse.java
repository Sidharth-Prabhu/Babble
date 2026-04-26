package com.example.demo.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ConversationResponse {
    private String username;
    private String displayName;
    private String profilePictureUrl;
    private String lastMessage;
    private LocalDateTime lastMessageTime;
    private boolean lastMessageFromMe;
}
