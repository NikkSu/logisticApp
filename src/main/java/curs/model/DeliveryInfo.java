package curs.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "delivery_info")
public class DeliveryInfo {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String originAddress;
    private String destinationAddress;

    private Double distanceKm;
    private Double estimatedTimeHours;

    private LocalDateTime lastUpdated = LocalDateTime.now();

    @ManyToOne
    @JoinColumn(name = "supplier_id")
    private Supplier supplier;
}
