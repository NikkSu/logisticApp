package curs.model;

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
}
