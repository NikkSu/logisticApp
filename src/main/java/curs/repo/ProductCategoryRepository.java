// src/main/java/curs/repo/ProductCategoryRepository.java
package curs.repo;

import curs.model.Category;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ProductCategoryRepository extends JpaRepository<Category, Long> {
    Optional<Category> findByName(String name);
}
