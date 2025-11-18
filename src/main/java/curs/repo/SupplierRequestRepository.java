package curs.repo;

import curs.model.SupplierRequest;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface SupplierRequestRepository extends JpaRepository<SupplierRequest, Long> {
    List<SupplierRequest> findAllByApprovedFalse();
}
