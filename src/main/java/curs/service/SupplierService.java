package curs.service;

import curs.dto.SupplierRequest;
import curs.model.Supplier;
import curs.model.User;
import curs.model.enums.SupplierStatus;
import curs.repo.SupplierRepository;
import curs.repo.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class SupplierService {

    private final SupplierRepository supplierRepository;
    private final UserRepository userRepository;

    public Supplier apply(User user, SupplierRequest req) {

        supplierRepository.findByUser(user).ifPresent(s -> {
            if (s.getStatus() == SupplierStatus.PENDING)
                throw new RuntimeException("Заявка уже отправлена");
        });

        Supplier s = new Supplier();
        s.setUser(user);
        s.setCompanyName(req.getCompanyName());
        s.setInn(req.getInn());
        s.setAddress(req.getAddress());
        s.setDescription(req.getDescription());
        s.setWebsite(req.getWebsite());
        s.setPhone(req.getPhone());
        s.setStatus(SupplierStatus.PENDING);

        return supplierRepository.save(s);
    }

    public Supplier getStatus(User user) {
        return supplierRepository.findByUser(user).orElse(null);
    }
    public List<Supplier> getPending() {
        return supplierRepository.findAllByStatus(SupplierStatus.PENDING);
    }

    public List<Supplier> getAll() {
        return supplierRepository.findAll();
    }

    public Supplier approve(Long id) {
        Supplier s = supplierRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Supplier not found"));

        s.setStatus(SupplierStatus.APPROVED);
        s.setRejectionReason(null);

        return supplierRepository.save(s);
    }

    public Supplier reject(Long id, String reason) {
        Supplier s = supplierRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Supplier not found"));

        s.setStatus(SupplierStatus.REJECTED);
        s.setRejectionReason(reason);

        return supplierRepository.save(s);
    }
}
