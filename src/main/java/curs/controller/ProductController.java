package curs.controller;

import curs.dto.ProductDTO;
import curs.mapper.ProductMapper;
import curs.model.Product;
import curs.service.ProductService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/products")
@CrossOrigin(origins = "http://localhost:3000")
public class ProductController {
    private final ProductService service;
    public ProductController(ProductService service) { this.service = service; }

    @GetMapping
    public ResponseEntity<?> all() {
        List<ProductDTO> dtos = service.getAll().stream().map(ProductMapper::toDTO).collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }

    @PostMapping
    public ResponseEntity<?> create(@RequestBody ProductDTO dto) {
        Product p = ProductMapper.toEntity(dto);
        if (dto.getSupplierId() != null) {
            Product tmp = new Product(); tmp.setSupplier(new curs.model.Supplier()); tmp.getSupplier().setId(dto.getSupplierId()); p.setSupplier(tmp.getSupplier());
        }
        Product saved = service.create(p);
        return ResponseEntity.ok(ProductMapper.toDTO(saved));
    }
}
