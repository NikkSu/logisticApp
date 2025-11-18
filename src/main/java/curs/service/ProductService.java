package curs.service;

import curs.model.Product;
import curs.repo.ProductRepository;
import curs.repo.SupplierRepository;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class ProductService {
    private final ProductRepository repo;
    private final SupplierRepository supplierRepo;
    public ProductService(ProductRepository repo, SupplierRepository supplierRepo) {
        this.repo = repo; this.supplierRepo = supplierRepo;
    }
    public List<Product> getAll() { return repo.findAll(); }
    public Product getById(Long id) { return repo.findById(id).orElseThrow(); }
    public Product create(Product p) {
        if (p.getSupplier() != null && p.getSupplier().getId() != null) {
            p.setSupplier(supplierRepo.findById(p.getSupplier().getId()).orElseThrow());
        }
        return repo.save(p);
    }
    public Product update(Long id, Product updated) {
        Product ex = getById(id);
        ex.setName(updated.getName());
        ex.setCategory(updated.getCategory());
        ex.setPrice(updated.getPrice());
        return repo.save(ex);
    }
    public void delete(Long id) { repo.deleteById(id); }
}
