package com.upf.backend.application.repository;

import java.util.Optional;
import java.util.UUID;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
<<<<<<< HEAD

=======
>>>>>>> a753ae4c3804856e5d10df5c80d2bdd284643164
import com.upf.backend.application.model.entity.Follow;

public interface FollowRepository extends JpaRepository<Follow, UUID> {
    
Optional<Follow> findByFollower_IdAndFollowing_Id(UUID followerId, UUID followedId);
    boolean existsByFollower_IdAndFollowing_Id(UUID followerId, UUID followedId);
    List<Follow> findByFollowing_Id(UUID followedId);   // mes followers
    List<Follow> findByFollower_Id(UUID followerId);   // je suis ces gens
    long countByFollowing_Id(UUID followedId);
    long countByFollower_Id(UUID followerId);
    void deleteByFollower_IdAndFollowing_Id(UUID followerId, UUID followedId);

}
