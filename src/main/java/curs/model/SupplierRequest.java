// src/main/java/curs/model/SupplierRequest.java
package curs.model;

import curs.model.enums.SupplierStatus;
import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Table(name = "supplier_requests")
@Data
public class SupplierRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, updatable = false)
    private User user;

    private String companyName;
    private String inn;
    private String address;
    private String description;
    private String website;
    private String phone;

    private LocalDateTime createdAt = LocalDateTime.now();

    @Enumerated(EnumType.STRING)
    private SupplierStatus status;

    private String rejectionReason;
}
