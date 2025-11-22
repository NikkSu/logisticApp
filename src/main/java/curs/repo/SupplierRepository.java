// src/main/java/curs/repo/SupplierRepository.java
package curs.repo;

import curs.model.Supplier;
import curs.model.User;
import curs.model.enums.SupplierStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface SupplierRepository extends JpaRepository<Supplier, Long> {
    Optional<Supplier> findByUser(User user);
    List<Supplier> findAllByStatus(SupplierStatus status);
}
