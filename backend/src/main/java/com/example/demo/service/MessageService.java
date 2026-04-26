package com.example.demo.service;

import com.example.demo.dto.ConversationResponse;
import com.example.demo.dto.MessageResponse;
import com.example.demo.model.Message;
import com.example.demo.model.User;
import com.example.demo.repository.MessageRepository;
import com.example.demo.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.HashMap;
import java.util.Map;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MessageService {

    private final MessageRepository messageRepository;
    private final UserRepository userRepository;

    @Transactional
    public MessageResponse sendMessage(User sender, String recipientUsername, String content) {
        User recipient = userRepository.findByUsername(recipientUsername)
                .orElseThrow(() -> new RuntimeException("Recipient not found"));

        Message message = Message.builder()
                .sender(sender)
                .recipient(recipient)
                .content(content)
                .build();

        return convertToResponse(messageRepository.save(message));
    }

    @Transactional(readOnly = true)
    public List<MessageResponse> getChatHistory(User user1, String username2) {
        User user2 = userRepository.findByUsername(username2)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return messageRepository.findChatHistory(user1, user2).stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ConversationResponse> getConversations(User user) {
        List<Message> userMessages = messageRepository.findBySenderOrRecipientOrderByCreatedAtDesc(user, user);
        
        Map<Long, Message> latestMessages = new HashMap<>();
        Map<Long, User> otherUsers = new HashMap<>();

        for (Message m : userMessages) {
            User other = m.getSender().getId().equals(user.getId()) ? m.getRecipient() : m.getSender();
            if (!latestMessages.containsKey(other.getId())) {
                latestMessages.put(other.getId(), m);
                otherUsers.put(other.getId(), other);
            }
        }
        
        return latestMessages.entrySet().stream()
                .map(entry -> {
                    User otherUser = otherUsers.get(entry.getKey());
                    Message latest = entry.getValue();
                    return ConversationResponse.builder()
                            .username(otherUser.getUsername())
                            .displayName(otherUser.getDisplayName() != null && !otherUser.getDisplayName().isEmpty() 
                                ? otherUser.getDisplayName() : otherUser.getUsername())
                            .profilePictureUrl(otherUser.getProfilePictureUrl())
                            .lastMessage(latest.isDeleted() ? "Message deleted" : latest.getContent())
                            .lastMessageTime(latest.getCreatedAt())
                            .lastMessageFromMe(latest.getSender().getId().equals(user.getId()))
                            .build();
                })
                .sorted((a, b) -> b.getLastMessageTime().compareTo(a.getLastMessageTime()))
                .collect(Collectors.toList());
    }

    @Transactional
    public MessageResponse editMessage(Long messageId, User currentUser, String newContent) {
        Message message = messageRepository.findById(messageId)
                .orElseThrow(() -> new RuntimeException("Message not found"));
        
        if (!message.getSender().getId().equals(currentUser.getId())) {
            throw new RuntimeException("You can only edit your own messages");
        }

        message.setContent(newContent);
        message.setEdited(true);
        return convertToResponse(messageRepository.save(message));
    }

    @Transactional
    public void deleteMessage(Long messageId, User currentUser) {
        Message message = messageRepository.findById(messageId)
                .orElseThrow(() -> new RuntimeException("Message not found"));
        
        if (!message.getSender().getId().equals(currentUser.getId())) {
            throw new RuntimeException("You can only delete your own messages");
        }

        message.setDeleted(true);
        message.setContent("This message was deleted");
        messageRepository.save(message);
    }

    private MessageResponse convertToResponse(Message message) {
        return MessageResponse.builder()
                .id(message.getId())
                .senderUsername(message.getSender().getUsername())
                .recipientUsername(message.getRecipient().getUsername())
                .content(message.isDeleted() ? "This message was deleted" : message.getContent())
                .isEdited(message.isEdited())
                .isDeleted(message.isDeleted())
                .createdAt(message.getCreatedAt())
                .build();
    }
}
