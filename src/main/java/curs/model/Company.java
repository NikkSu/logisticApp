package curs.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import curs.model.enums.CompanyType;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Entity
@Getter
@Setter
public class Company {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    private String address;
    @Column(name = "logo_path")
    private String logoPath = "/uploads/company-logos/default.png";
    @Column(columnDefinition = "text")
    private String description;

    @ManyToOne
    private User owner;

    @OneToMany(mappedBy = "company")
    private List<User> users;
    @Column
    private Double latitude;

    @Column
    private Double longitude;
    @Enumerated(EnumType.STRING)
    private CompanyType type;
    @Column
    private String inn;

    @Column
    private String phone;

    @Column
    private String contactEmail;

    @Column
    private String website;

}
