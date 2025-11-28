package curs.repo;

import curs.model.Company;
import curs.model.enums.CompanyType;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CompanyRepository extends JpaRepository<Company, Long> {
    boolean existsByNameIgnoreCase(String name);
    List<Company> findAllByType(CompanyType type);

}