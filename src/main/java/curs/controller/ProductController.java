package curs.controller;

import curs.dto.ProductDto;
import curs.mapper.ProductMapper;
import curs.service.ProductService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/products")
@RequiredArgsConstructor
public class ProductController {

    private final ProductService productService;

    @GetMapping("")
    public List<ProductDto> all() {
        return productService.findAll()
                .stream().map(ProductMapper::toDto).toList();
    }

    @GetMapping("/supplier/{id}")
    public List<ProductDto> bySupplier(@PathVariable Long id) {
        return productService.findBySupplier(id)
                .stream().map(ProductMapper::toDto).toList();
    }
}
