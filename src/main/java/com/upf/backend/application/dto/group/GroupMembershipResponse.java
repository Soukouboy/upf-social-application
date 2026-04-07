package com.upf.backend.application.dto.group;

<<<<<<< HEAD
import java.time.LocalDateTime;
import java.util.UUID;

import com.upf.backend.application.model.enums.RoleMember;

=======
import com.upf.backend.application.model.enums.RoleMember;

import java.time.LocalDateTime;
import java.util.UUID;

>>>>>>> a753ae4c3804856e5d10df5c80d2bdd284643164
public record GroupMembershipResponse(
        UUID id,
        UUID groupId,
        UUID studentProfileId,
        String firstName,
        String lastName,
        RoleMember role,
        LocalDateTime joinedAt,
        LocalDateTime lastReadAt
) {}
