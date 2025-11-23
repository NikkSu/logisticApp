package curs.service;

import curs.dto.ProductCreateDto;
import curs.dto.ProductDto;
import curs.model.Product;
import curs.model.Supplier;
import curs.model.User;
import curs.repo.ProductRepository;
import curs.repo.SupplierRepository;
import curs.repo.UserRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;


@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository productRepository;
    private final SupplierRepository supplierRepository;
    private final UserRepository userRepository;
    private final FileService fileService;

    public List<Product> listBySupplierUser(Long userId) {
        Supplier supplier = supplierRepository.findByUser(
                userRepository.findById(userId)
                        .orElseThrow(() -> new RuntimeException("User not found"))
        ).orElseThrow(() -> new RuntimeException("Not a supplier"));

        return productRepository.findAllBySupplier(supplier);
    }
    public List<Product> listBySupplier(Long supplierId)
    { Supplier s = supplierRepository.findById(supplierId).orElseThrow(()
            -> new RuntimeException("Supplier not found"));
        return productRepository.findAllBySupplier(s); }
    @Transactional
    public Product createForUser(Long userId, ProductCreateDto dto) {
        User user = userRepository.findById(userId).orElseThrow();
        Supplier supplier = supplierRepository.findByUser(user)
                .orElseThrow(() -> new RuntimeException("You are not a supplier"));

        Product p = new Product();
        p.setName(dto.getName());
        p.setCategory(dto.getCategory());
        p.setPrice(dto.getPrice());
        p.setDescription(dto.getDescription());
        p.setSupplier(supplier);

        return productRepository.save(p);
    }

    @Transactional
    public Product updateForUser(Long userId, Long productId, ProductCreateDto dto) {
        Product p = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        if (!p.getSupplier().getUser().getId().equals(userId))
            throw new RuntimeException("Not allowed");

        if (dto.getName() != null) p.setName(dto.getName());
        if (dto.getCategory() != null) p.setCategory(dto.getCategory());
        if (dto.getPrice() != null) p.setPrice(dto.getPrice());
        if (dto.getDescription() != null) p.setDescription(dto.getDescription());

        return productRepository.save(p);
    }

    @Transactional
    public void deleteForUser(Long userId, Long productId) {
        Product p = productRepository.findById(productId).orElseThrow();
        if (!p.getSupplier().getUser().getId().equals(userId))
            throw new RuntimeException("Not allowed");
        productRepository.delete(p);
    }

    @Transactional
    public String uploadImage(Long userId, Long productId, MultipartFile file) {
        Product p = productRepository.findById(productId).orElseThrow();
        if (!p.getSupplier().getUser().getId().equals(userId))
            throw new RuntimeException("Not allowed");

        String path = fileService.saveProductImage(file, productId);
        p.setImagePath(path);
        productRepository.save(p);
        return path;
    }

    public List<Product> listByCategory(String cat) {
        return productRepository.findAllByCategory(cat);
    }

    public List<Product> listAll() {
        return productRepository.findAll();
    }
}
