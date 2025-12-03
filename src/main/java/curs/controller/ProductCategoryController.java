// src/main/java/curs/controller/ProductCategoryController.java
package curs.controller;

import curs.model.Category;
import curs.repo.ProductCategoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/categories")
@RequiredArgsConstructor
public class ProductCategoryController {

    private final ProductCategoryRepository categoryRepository;

    @GetMapping("")
    public ResponseEntity<List<Category>> all() {
        return ResponseEntity.ok(categoryRepository.findAll());
    }

    @PostMapping("/create")
    public ResponseEntity<Category> create(@RequestBody Category c) {
        return ResponseEntity.ok(categoryRepository.save(c));
    }
}
