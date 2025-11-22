// src/main/java/curs/service/SupplierService.java
package curs.service;

import curs.dto.SupplierRequestDto;
import curs.model.Supplier;
import curs.model.SupplierRequest;
import curs.model.User;
import curs.model.enums.SupplierStatus;
import curs.repo.SupplierRepository;
import curs.repo.SupplierRequestRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import jakarta.transaction.Transactional;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class SupplierService {

    private final SupplierRequestRepository supplierRequestRepository;
    private final SupplierRepository supplierRepository;

    public SupplierRequest createRequest(User user, SupplierRequestDto dto) {
        Optional<SupplierRequest> existing = supplierRequestRepository.findByUser(user);
        if (existing.isPresent() && existing.get().getStatus() == SupplierStatus.PENDING) {
            throw new RuntimeException("Заявка уже отправлена");
        }

        SupplierRequest r = new SupplierRequest();
        r.setUser(user);
        r.setCompanyName(dto.getCompanyName());
        r.setInn(dto.getInn());
        r.setAddress(dto.getAddress());
        r.setDescription(dto.getDescription());
        r.setWebsite(dto.getWebsite());
        r.setPhone(dto.getPhone());
        r.setStatus(SupplierStatus.PENDING);
        r.setRejectionReason(null);

        return supplierRequestRepository.save(r);
    }

    public SupplierRequest getStatus(User user) {
        return supplierRequestRepository.findByUser(user).orElse(null);
    }

    @Transactional
    public Supplier approveRequestToSupplier(Long requestId) {
        SupplierRequest req = supplierRequestRepository.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Request not found"));

        req.setStatus(SupplierStatus.APPROVED);
        req.setRejectionReason(null);
        supplierRequestRepository.save(req);

        Supplier s = new Supplier();
        s.setUser(req.getUser());
        s.setCompanyName(req.getCompanyName());
        s.setInn(req.getInn());
        s.setAddress(req.getAddress());
        s.setDescription(req.getDescription());
        s.setWebsite(req.getWebsite());
        s.setPhone(req.getPhone());
        s.setStatus(SupplierStatus.APPROVED);

        return supplierRepository.save(s);
    }

    @Transactional
    public SupplierRequest rejectRequest(Long requestId, String reason) {
        SupplierRequest req = supplierRequestRepository.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Request not found"));
        req.setStatus(SupplierStatus.REJECTED);
        req.setRejectionReason(reason);
        return supplierRequestRepository.save(req);
    }
}
