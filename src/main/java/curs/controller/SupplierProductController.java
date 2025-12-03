// src/main/java/curs/controller/SupplierProductController.java
package curs.controller;

import curs.dto.ProductCreateDto;
import curs.dto.ProductDto;
import curs.mapper.ProductMapper;
import curs.model.Product;
import curs.model.User;
import curs.service.FileService;
import curs.service.ProductService;
import curs.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.security.Principal;
import java.util.List;
import java.util.stream.Collectors;
@RestController
@RequestMapping("/api/supplier/products")
@RequiredArgsConstructor
public class SupplierProductController {

    private final ProductService productService;
    private final UserService userService;

    private User getUser(Principal principal) {
        return userService.findByUsername(principal.getName());
    }

    @GetMapping("")
    public ResponseEntity<List<ProductDto>> myProducts(Principal principal) {
        User user = getUser(principal);
        var list = productService.listBySupplierUser(user.getId());
        return ResponseEntity.ok(list.stream().map(ProductMapper::toDto).toList());
    }

    @PostMapping("")
    public ResponseEntity<ProductDto> create(@RequestBody ProductCreateDto dto, Principal principal) {
        User u = getUser(principal);
        return ResponseEntity.ok(ProductMapper.toDto(productService.createForUser(u.getId(), dto)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ProductDto> update(@PathVariable Long id, @RequestBody ProductCreateDto dto,
                                             Principal principal) {
        User u = getUser(principal);
        return ResponseEntity.ok(ProductMapper.toDto(productService.updateForUser(u.getId(), id, dto)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id, Principal principal) {
        User u = getUser(principal);
        productService.deleteForUser(u.getId(), id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/upload-image")
    public ResponseEntity<?> upload(@PathVariable Long id, @RequestParam("file") MultipartFile file,
                                    Principal principal) {
        User u = getUser(principal);
        String path = productService.uploadImage(u.getId(), id, file);
        return ResponseEntity.ok(java.util.Map.of("path", path));
    }
}
