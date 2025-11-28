// src/main/java/curs/controller/SupplierController.java
package curs.controller;

import curs.dto.ProductDto;
import curs.dto.SupplierRequestDto;
import curs.mapper.ProductMapper;
import curs.mapper.SupplierRequestMapper;
import curs.model.Company;
import curs.model.Supplier;
import curs.model.SupplierRequest;
import curs.model.User;
import curs.repo.CompanyRepository;
import curs.repo.SupplierRepository;
import curs.service.FileService;
import curs.service.ProductService;
import curs.service.SupplierService;
import curs.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.security.Principal;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/supplier")
@RequiredArgsConstructor
public class SupplierController {

    private final SupplierService supplierService;
    private final UserService userService;
    private final SupplierRequestMapper supplierRequestMapper;
    private final ProductService productService;
    private final SupplierRepository supplierRepository;
    private final FileService fileService;
    private final CompanyRepository companyRepository;

    private User getUser(Principal principal) {
        return userService.findByUsername(principal.getName());
    }
    @GetMapping("/my")
    public Supplier getMySupplier(Principal principal) {
        User u = userService.findByUsername(principal.getName());
        return supplierRepository.findByUser(u)
                .orElseThrow(() -> new RuntimeException("You are not a supplier"));
    }
    @PostMapping("/apply")
    public SupplierRequestDto apply(@RequestBody SupplierRequestDto dto, Principal principal) {
        User user = getUser(principal);
        SupplierRequest req = supplierService.createRequest(user, dto);
        return supplierRequestMapper.toDto(req);
    }
    @GetMapping("/by-user/{userId}")
    public Long getSupplierIdByUserId(@PathVariable Long userId) {
        Supplier supplier = supplierRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Supplier not found for user " + userId));

        return supplier.getId();
    }
    @GetMapping("/by-company/{companyId}")
    public Long getSupplierIdByCompany(@PathVariable Long companyId) {
        Company company = companyRepository.findById(companyId)
                .orElseThrow(() -> new RuntimeException("Company not found: " + companyId));

        Supplier supplier = supplierRepository.findByCompanyName(company.getName())
                .orElseThrow(() -> new RuntimeException("Supplier not found for company name: " + company.getName()));

        return supplier.getId();
    }

    @GetMapping("/status")
    public SupplierRequestDto getStatus(Principal principal) {
        User user = getUser(principal);
        SupplierRequest req = supplierService.getStatus(user);
        return supplierRequestMapper.toDto(req);
    }
    @GetMapping("/my/products")
    public ResponseEntity<List<ProductDto>> myProducts(Principal principal) {
        User user = getUser(principal);
        Supplier supplier = supplierRepository.findByUser(user).orElseThrow(() -> new RuntimeException("Supplier not found"));
        List<ProductDto> products = productService.listBySupplier(supplier.getId()).stream().map(p -> {
            ProductDto d = new ProductDto();
            d.setId(p.getId());
            d.setName(p.getName());
            d.setCategory(p.getCategory());
            d.setPrice(p.getPrice());
            d.setDescription(p.getDescription());
            d.setImagePath(p.getImagePath());
            d.setSupplierId(supplier.getId());
            return d;
        }).collect(Collectors.toList());
        return ResponseEntity.ok(products);
    }

    @PostMapping("/upload-logo")
    public ResponseEntity<?> uploadMyLogo(@RequestParam("file") MultipartFile file, Principal principal) {
        User user = getUser(principal);
        Supplier supplier = supplierRepository.findByUser(user).orElseThrow(() -> new RuntimeException("Supplier not found"));
        String path = fileService.saveSupplierLogo(file, supplier.getId());
        supplier.setLogoPath(path);
        supplierRepository.save(supplier);
        return ResponseEntity.ok(Map.of("path", path));
    }
}
