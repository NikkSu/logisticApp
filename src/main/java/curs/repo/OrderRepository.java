package curs.repo;

import curs.model.Order;
import curs.model.Supplier;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Collection;
import java.util.List;

public interface OrderRepository extends JpaRepository<Order, Long> {
    List<Order> findByCompanyId(Long companyId);
    List<Order> findBySupplier(Supplier supplier);

    List<Order> findByUserId(Long userId);

}
