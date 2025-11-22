package curs.service;

import curs.dto.*;
import curs.mapper.AdminMapper;
import curs.mapper.CompanyMapper;
import curs.mapper.SupplierRequestMapper;
import curs.model.*;
import curs.model.SupplierRequest;
import curs.model.enums.Role;
import curs.model.enums.SupplierStatus;
import curs.repo.*;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
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
    private final CompanyMapper companyMapper;
    private final AdminMapper mapper;
    private final SupplierRequestMapper requestMapper;
    private final NotificationService notificationService;
    @Autowired
    private PasswordEncoder passwordEncoder;

    // ---- Users ----
    public User createUser(User u) {
        if (u.getPassword() == null || u.getPassword().isBlank()) {
            u.setPassword(passwordEncoder.encode("123456")); // default password
        }
        return userRepository.save(u);
    }
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
    public CompanyDto createCompanyAsAdmin(Long ownerId, String name, String address, String description) {

        User owner = userRepository.findById(ownerId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (companyRepository.existsByNameIgnoreCase(name)) {
            throw new RuntimeException("Компания с таким именем уже существует");
        }

        Company company = new Company();
        company.setName(name);
        company.setAddress(address);
        company.setDescription(description);
        company.setOwner(owner);

        companyRepository.save(company);

        owner.setCompany(company);
        userRepository.save(owner);

        return companyMapper.toDto(company);
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
        return supplierRepository.findAll().stream()
                .map(mapper::toSupplierDto)
                .collect(Collectors.toList());
    }

    public List<SupplierRequestDto> listPendingSupplierRequests() {
        return supplierRequestRepository.findAllByStatus(SupplierStatus.PENDING)
                .stream()
                .map(requestMapper::toDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public AdminSupplierDto approveSupplier(Long requestId) {
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

        s = supplierRepository.save(s);

        User u = req.getUser();
        if (u != null) {
            u.setRole(Role.SUPPLIER);
            userRepository.save(u);
            notificationService.createNotification(u.getId(), "Ваша заявка поставщика одобрена.");
        }

        return mapper.toSupplierDto(s);
    }

    @Transactional
    public void rejectSupplier(Long requestId, String reason) {
        SupplierRequest req = supplierRequestRepository.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Request not found"));
        req.setStatus(SupplierStatus.REJECTED);
        req.setRejectionReason(reason);
        supplierRequestRepository.save(req);
        User u = req.getUser();
        if (u != null) {
            notificationService.createNotification(u.getId(), "Ваша заявка поставщика отклонена. Причина: " + (reason == null ? "не указана" : reason));
        }
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
    @Transactional
    public NotificationDto createNotification(CreateNotificationRequest req) {

        Notification n = new Notification();
        n.setMessage(req.getMessage());
        n.setCreatedAt(LocalDateTime.now());
        n.setRead(false);

        if (req.getUserId() != null) {
            User u = userRepository.findById(req.getUserId())
                    .orElseThrow(() -> new RuntimeException("User not found"));
            n.setUser(u);
        }

        notificationRepository.save(n);

        return mapper.toNotificationDto(n);
    }


}
