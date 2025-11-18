package curs.model;

import curs.model.enums.CompanyRequestStatus;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Getter
@Setter
public class CompanyRequest {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    private User requester;

    @ManyToOne
    private Company company;

    @Enumerated(EnumType.STRING)
    private CompanyRequestStatus status = CompanyRequestStatus.PENDING;
}
