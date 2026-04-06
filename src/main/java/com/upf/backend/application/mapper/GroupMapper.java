package com.upf.backend.application.mapper;

import com.upf.backend.application.dto.group.AcademicGroupResponse;
import com.upf.backend.application.dto.group.GroupDetailResponse;
import com.upf.backend.application.dto.group.GroupMembershipResponse;
import com.upf.backend.application.dto.group.GroupMessageResponse;
import com.upf.backend.application.model.entity.AcademicGroup;
import com.upf.backend.application.model.entity.GroupMembership;
import com.upf.backend.application.model.entity.Messages;

import java.util.List;
import java.util.stream.Collectors;

public class GroupMapper {

    public static AcademicGroupResponse toResponse(AcademicGroup group) {
        if (group == null) {
            return null;
        }

        return new AcademicGroupResponse(
                group.getId(),
                group.getName(),
                group.getDescription(),
                group.getCoverImageUrl(),
                group.getType(),
                group.getMajor(),
                group.getCreatedBy(),
                group.getMemberCount(),
                group.getMessageCount(),
                group.isActive(),
                group.getCreatedAt(),
                group.getUpdatedAt()
        );
    }

    public static GroupDetailResponse toDetailResponse(AcademicGroup group) {
        if (group == null) {
            return null;
        }

        List<GroupMessageResponse> messages = group.getMessages().stream()
                .map(GroupMapper::messageToResponse)
                .collect(Collectors.toList());

        return new GroupDetailResponse(
                group.getId(),
                group.getName(),
                group.getDescription(),
                group.getCoverImageUrl(),
                group.getType(),
                group.getMajor(),
                group.getCreatedBy(),
                group.getMemberCount(),
                group.getMessageCount(),
                group.isActive(),
                group.getCreatedAt(),
                group.getUpdatedAt(),
                messages
        );
    }

    public static GroupMembershipResponse toResponse(GroupMembership membership) {
        if (membership == null) {
            return null;
        }

        String firstName = null;
        String lastName = null;
        if (membership.getStudentProfile() != null && membership.getStudentProfile().getUser() != null) {
            firstName = membership.getStudentProfile().getUser().getFirstName();
            lastName = membership.getStudentProfile().getUser().getLastName();
        }

        return new GroupMembershipResponse(
                membership.getId(),
                membership.getGroup() != null ? membership.getGroup().getId() : null,
                membership.getStudentProfile() != null ? membership.getStudentProfile().getId() : null,
                firstName,
                lastName,
                membership.getRole(),
                membership.getJoinedAt(),
                membership.getLastReadAt()
        );
    }

    public static GroupMessageResponse messageToResponse(Messages message) {
        if (message == null) {
            return null;
        }

        return new GroupMessageResponse(
                message.getId(),
                message.getContent(),
                message.getSenderId(),
                message.getMessageType(),
                message.getFileUrl(),
                message.getFileName(),
                message.getFileSize(),
                message.getReplyToId(),
                message.isEdited(),
                message.getEditedAt(),
                message.getCreatedAt()
        );
    }
}
