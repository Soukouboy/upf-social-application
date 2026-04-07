package com.upf.backend.application.services;


import com.upf.backend.application.dto.PrivateConversationSummaryResponse;
import com.upf.backend.application.model.entity.AcademicGroup;
import com.upf.backend.application.model.entity.Messages;
import com.upf.backend.application.model.enums.ContextMessage;
import com.upf.backend.application.dto.PrivateConversationSummaryResponse;
import com.upf.backend.application.repository.GroupMembershipRepository;
import com.upf.backend.application.repository.GroupRepository;
import com.upf.backend.application.repository.MessageRepository;
import com.upf.backend.application.repository.StudentRepository;
import com.upf.backend.application.services.Exceptions.AccessDeniedBusinessException;
import com.upf.backend.application.services.Exceptions.BusinessException;
import com.upf.backend.application.services.Exceptions.ResourceNotFoundException;
import com.upf.backend.application.services.Interfaces.IChatService;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@Transactional
public class ChatService implements IChatService {

    private final NotificationService notificationService;
    private final MessageRepository messageRepository;
    private final GroupRepository groupRepository;
    private final GroupMembershipRepository membershipRepository;
    private final StudentRepository studentRepository;

    public ChatService(MessageRepository messageRepository,
                           GroupRepository groupRepository,
                           GroupMembershipRepository membershipRepository,
                           StudentRepository studentRepository, NotificationService notificationService) {
        this.messageRepository = messageRepository;
        this.groupRepository = groupRepository;
        this.membershipRepository = membershipRepository;
        this.studentRepository = studentRepository;
        this.notificationService = notificationService;
    }

    @Override
    public Messages sendGroupMessage(UUID senderId, UUID groupId, String content) {
        if (content == null || content.isBlank()) {
            throw new BusinessException("Le contenu du message est obligatoire.");
        }

        AcademicGroup group = groupRepository.findById(groupId)
                .orElseThrow(() -> new ResourceNotFoundException("Groupe introuvable."));

        if (!group.isActive()) {
            throw new BusinessException("Impossible d'envoyer un message dans un groupe inactif.");
        }

        studentRepository.findById(senderId)
                .orElseThrow(() -> new ResourceNotFoundException("Étudiant expéditeur introuvable."));

        if (!membershipRepository.existsByGroup_IdAndStudentProfile_Id(groupId, senderId)) {
            throw new AccessDeniedBusinessException("L'étudiant n'est pas membre du groupe.");
        }

        Messages message = new Messages();
        message.setSenderId(senderId);
        message.setContent(content.trim());
        message.setContext(ContextMessage.GROUP);

        group.addMessage(message);
        AcademicGroup savedGroup = groupRepository.save(group);

        return savedGroup.getMessages()
                .get(savedGroup.getMessages().size() - 1);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<Messages> getGroupMessages(UUID groupId, Pageable pageable) {
        groupRepository.findById(groupId)
                .orElseThrow(() -> new ResourceNotFoundException("Groupe introuvable."));

        return messageRepository.findByGroup_IdAndIsDeletedFalseOrderByCreatedAtAsc(groupId, pageable);
    }

//     @Override
//     @Transactional(readOnly = true)
//     public Page<Messages> getGroupMessagesBefore(UUID groupId,
//                                                 LocalDateTime before,
//                                                 Pageable pageable) {
//         if (before == null) {
//             throw new BusinessException("La borne temporelle 'before' est obligatoire.");
//         }

//         groupRepository.findById(groupId)
//                 .orElseThrow(() -> new ResourceNotFoundException("Groupe introuvable."));

//         return messageRepository.findByGroup_IdAndCreatedAtLessThanOrderByCreatedAtDesc(
//                 groupId,
//                 before,
//                 pageable
//         );
//     }

    @Override
    public Messages sendPrivateMessage(UUID senderId, UUID recipientId, String content) {
        if (content == null || content.isBlank()) {
            throw new BusinessException("Le contenu du message est obligatoire.");
        }

        studentRepository.findById(senderId)
                .orElseThrow(() -> new ResourceNotFoundException("Expéditeur introuvable."));

        studentRepository.findById(recipientId)
                .orElseThrow(() -> new ResourceNotFoundException("Destinataire introuvable."));

        Messages message = new Messages();
        message.setSenderId(senderId);
        message.setRecipientId(recipientId);
        message.setContent(content.trim());
        message.setContext(ContextMessage.PRIVATE);

       
        return messageRepository.save(message);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<Messages> getPrivateConversation(UUID userA,
                                                UUID userB,
                                                Pageable pageable) {
        studentRepository.findById(userA)
                .orElseThrow(() -> new ResourceNotFoundException("Utilisateur A introuvable."));
        studentRepository.findById(userB)
                .orElseThrow(() -> new ResourceNotFoundException("Utilisateur B introuvable."));

        return messageRepository.findPrivateConversation(
                userA,
                userB,
                pageable
        );
    }

    @Override
    @Transactional(readOnly = true)
    public Page<PrivateConversationSummaryResponse> listPrivateConversations(UUID userId, Pageable pageable) {
        studentRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Utilisateur introuvable."));

        return messageRepository.findPrivateConversationSummaries(userId, pageable);
    }
}