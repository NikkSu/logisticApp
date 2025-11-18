package curs.repo;

import curs.model.Company;
import curs.model.CompanyRequest;
import curs.model.User;
import curs.model.enums.CompanyRequestStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CompanyRequestRepository extends JpaRepository<CompanyRequest, Long> {
    List<CompanyRequest> findByCompanyIdAndStatus(Long companyId, CompanyRequestStatus status);

    void deleteAllByCompanyId(Long companyId);

    boolean existsByRequesterAndCompany(User user, Company company);
}
