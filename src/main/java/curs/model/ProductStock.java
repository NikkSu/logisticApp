package curs.model;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "product_stock")
@Data
public class ProductStock {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    private Product product;

    private Integer quantityAvailable;
}
