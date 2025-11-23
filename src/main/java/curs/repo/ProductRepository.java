// src/main/java/curs/repo/ProductRepository.java
package curs.repo;

import curs.model.Product;
import curs.model.Supplier;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ProductRepository extends JpaRepository<Product, Long> {
    List<Product> findAllBySupplier(Supplier supplier);
    List<Product> findAllByCategory(String category);
}
