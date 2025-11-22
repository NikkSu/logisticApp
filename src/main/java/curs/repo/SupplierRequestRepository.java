// src/main/java/curs/repo/SupplierRequestRepository.java
package curs.repo;

import curs.model.SupplierRequest;
import curs.model.User;
import curs.model.enums.SupplierStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface SupplierRequestRepository extends JpaRepository<SupplierRequest, Long> {
    List<SupplierRequest> findAllByUserOrderByCreatedAtDesc(User user);
    Optional<SupplierRequest> findByUser(User user);
    List<SupplierRequest> findAllByStatus(SupplierStatus status);
}
