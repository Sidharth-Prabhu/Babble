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
public class MessageResponse {
    private Long id;
    private String senderUsername;
    private String recipientUsername;
    private String content;
    private boolean isEdited;
    private boolean isDeleted;
    private LocalDateTime createdAt;
}
