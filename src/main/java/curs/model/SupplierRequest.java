package curs.model;

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
    @OneToOne
    @JoinColumn(name = "user_id")
    private User user;

    private String companyName;
    private String inn;
    private String address;
    private String description;
    private String website;
    private String phone;

    private LocalDateTime createdAt = LocalDateTime.now();

    // заявка обработана админом?
    private boolean approved = false;

    // отклонена ли заявка?
    private boolean rejected = false;

    // причина отказа
    private String rejectionReason;
}
