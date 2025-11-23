package curs.model;

import jakarta.persistence.*;
import lombok.Data;


import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Entity
@Getter
@Setter
public class Category {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;

    @Column(columnDefinition = "text")
    private String description;

    // parent category
    @ManyToOne
    @JoinColumn(name = "parent_id")
    private Category parent;

    // children
    @OneToMany(mappedBy = "parent", cascade = CascadeType.ALL)
    private List<Category> children;
}
