package curs.repo;

import curs.model.DeliveryInfo;
import org.springframework.data.jpa.repository.JpaRepository;

public interface DeliveryInfoRepository extends JpaRepository<DeliveryInfo, Long> {
}
