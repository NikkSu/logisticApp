package curs.service;

import curs.dto.*;
import curs.mapper.AdminMapper;
import curs.model.*;
import curs.model.SupplierRequest;
import curs.repo.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AdminService {

    private final UserRepository userRepository;
    private final CompanyRepository companyRepository;
    private final SupplierRepository supplierRepository;
    private final SupplierRequestRepository supplierRequestRepository;
    private final OrderRepository orderRepository;
    private final NotificationRepository notificationRepository;

    private final AdminMapper mapper;
    private final NotificationService notificationService;

    // ---- Users ----
    public User createUser(User u) { return userRepository.save(u); }
    public List<AdminUserDto> listUsers() {
        return userRepository.findAll().stream().map(mapper::toAdminUserDto).collect(Collectors.toList());
    }

    public AdminUserDto getUser(Long id) {
        return userRepository.findById(id).map(mapper::toAdminUserDto)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    @Transactional
    public AdminUserDto changeUserRole(Long id, String roleStr) {
        User u = userRepository.findById(id).orElseThrow(() -> new RuntimeException("User not found"));
        try {
            u.setRole(Enum.valueOf(curs.model.enums.Role.class, roleStr));
        } catch (IllegalArgumentException ex) {
            throw new RuntimeException("Invalid role: " + roleStr);
        }
        userRepository.save(u);
        return mapper.toAdminUserDto(u);
    }

    @Transactional
    public void deleteUser(Long id) {
        // remove references: if user is owner of company -> revoke owner or delete company
        userRepository.findById(id).ifPresent(u -> {
            if (u.getCompany() != null && u.getCompany().getOwner() != null && u.getCompany().getOwner().getId().equals(id)) {
                // Option: transfer ownership to null and notify users, here we delete company
                Long companyId = u.getCompany().getId();
                // remove relations and notify users
                companyRepository.findById(companyId).ifPresent(companyRepository::delete);
            }
            userRepository.delete(u);
        });
    }

    // ---- Companies ----
    public List<CompanyDto> listCompanies() {
        return companyRepository.findAll().stream().map(mapper::toCompanyDto).collect(Collectors.toList());
    }

    public CompanyDto getCompany(Long id) {
        return companyRepository.findById(id).map(mapper::toCompanyDto).orElseThrow(() -> new RuntimeException("Company not found"));
    }

    @Transactional
    public void deleteCompanyAsAdmin(Long companyId) {
        Company c = companyRepository.findById(companyId).orElseThrow(() -> new RuntimeException("Company not found"));
        // notify users and clear company link
        List<User> users = userRepository.findByCompanyId(companyId);
        for (User u: users) {
            u.setCompany(null);
            userRepository.save(u);
            notificationService.createNotification(u.getId(), "Компания \"" + c.getName() + "\" была удалена администратором.");
        }
        // delete company requests and company
        companyRepository.delete(c);
    }

    // ---- Suppliers & Requests ----
    public List<AdminSupplierDto> listSuppliers() {
        return supplierRepository.findAll().stream().map(mapper::toAdminSupplierDto).collect(Collectors.toList());
    }

    public List<SupplierRequestDto> listPendingSupplierRequests() {
        return supplierRequestRepository.findAllByApprovedFalse()
                .stream()
                .map(mapper::toSupplierRequestDto)
                .collect(Collectors.toList());
    }


    @Transactional
    public AdminSupplierDto approveSupplier(Long requestId) {
        SupplierRequest sr = supplierRequestRepository.findById(requestId).orElseThrow(() -> new RuntimeException("Request not found"));
        // create supplier entity or activate it
        Supplier s = supplierRepository.findByUser(sr.getUser())
                .orElseGet(() -> {
                    Supplier ns = new Supplier();
                    ns.setUser(sr.getUser());
                    ns.setCompanyName(sr.getCompanyName());
                    ns.setInn(sr.getInn());
                    ns.setAddress(sr.getAddress());
                    ns.setDescription(sr.getDescription());
                    ns.setWebsite(sr.getWebsite());
                    ns.setPhone(sr.getPhone());
                    ns.setStatus(curs.model.enums.SupplierStatus.APPROVED);
                    return supplierRepository.save(ns);
                });
        sr.setApproved(true);
        supplierRequestRepository.save(sr);
        notificationService.createNotification(sr.getUser().getId(), "Ваша заявка поставщика одобрена.");
        return mapper.toAdminSupplierDto(s);
    }

    @Transactional
    public void rejectSupplier(Long requestId, String reason) {
        SupplierRequest sr = supplierRequestRepository.findById(requestId).orElseThrow(() -> new RuntimeException("Request not found"));
        sr.setApproved(true);
        sr.setRejected(true);
        sr.setRejectionReason(reason);
        supplierRequestRepository.save(sr);
        notificationService.createNotification(sr.getUser().getId(), "Ваша заявка поставщика отклонена. Причина: " + (reason == null ? "не указана" : reason));
    }

    // ---- Orders ----
    public List<AdminOrderDto> listOrders() {
        return orderRepository.findAll().stream().map(mapper::toAdminOrderDto).collect(Collectors.toList());
    }

    @Transactional
    public void deleteOrder(Long id) {
        orderRepository.findById(id).ifPresent(orderRepository::delete);
    }

    // ---- Notifications ----
    public List<NotificationDto> listNotifications() {
        return notificationRepository.findAll().stream().map(mapper::toNotificationDto).collect(Collectors.toList());
    }
    public void deleteNotification(Long id) {
        notificationRepository.deleteById(id);
    }
}
