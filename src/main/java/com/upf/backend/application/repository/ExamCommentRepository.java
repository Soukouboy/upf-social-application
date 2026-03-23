package com.upf.backend.application.repository;
import java.util.UUID;
import com.upf.backend.application.model.entity.ExamComment;
import org.springframework.data.jpa.repository.JpaRepository;
public interface ExamCommentRepository extends JpaRepository<ExamComment, UUID>     {

}
