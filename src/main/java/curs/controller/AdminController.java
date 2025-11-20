package curs.controller;

import curs.dto.*;
import curs.mapper.AdminMapper;
import curs.model.User;
import curs.service.AdminService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final AdminService adminService;
    private final AdminMapper adminMapper;

    // --- USERS ---
    @GetMapping("/users")
    public ResponseEntity<List<AdminUserDto>> listUsers() {
        return ResponseEntity.ok(adminService.listUsers());
    }

    @GetMapping("/users/{id}")
    public ResponseEntity<AdminUserDto> getUser(@PathVariable Long id) {
        return ResponseEntity.ok(adminService.getUser(id));
    }

    @PutMapping("/users/{id}/role")
    public ResponseEntity<AdminUserDto> changeUserRole(@PathVariable Long id, @RequestParam("role") String role) {
        return ResponseEntity.ok(adminService.changeUserRole(id, role));
    }

    @DeleteMapping("/users/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        adminService.deleteUser(id);
        return ResponseEntity.noContent().build();
    }
        @PostMapping("/users/create")
        public ResponseEntity<AdminUserDto> createUser(@RequestBody AdminUserDto user) {
            User entity = adminMapper.toUser(user);
            User saved = adminService.createUser(entity);
            AdminUserDto response = adminMapper.toAdminUserDto(saved);

            return ResponseEntity.ok(response);
        }
    // --- COMPANIES ---
    @GetMapping("/companies")
    public ResponseEntity<List<CompanyDto>> listCompanies() {
        return ResponseEntity.ok(adminService.listCompanies());
    }
    @PostMapping("/companies/create")
    public ResponseEntity<CompanyDto> createCompany(@RequestBody CompanyDto dto) {

        CompanyDto saved = adminService.createCompanyAsAdmin(
                dto.getOwnerId(),
                dto.getName(),
                dto.getAddress(),
                dto.getDescription()
        );

        return ResponseEntity.ok(saved);
    }

    @GetMapping("/companies/{id}")
    public ResponseEntity<CompanyDto> getCompany(@PathVariable Long id) {
        return ResponseEntity.ok(adminService.getCompany(id));
    }

    @DeleteMapping("/companies/{id}")
    public ResponseEntity<Void> deleteCompany(@PathVariable Long id) {
        adminService.deleteCompanyAsAdmin(id);
        return ResponseEntity.noContent().build();
    }

    // --- SUPPLIERS & SUPPLIER REQUESTS ---
    @GetMapping("/suppliers")
    public ResponseEntity<List<AdminSupplierDto>> listSuppliers() {
        return ResponseEntity.ok(adminService.listSuppliers());
    }

    @GetMapping("/supplier-requests")
    public ResponseEntity<List<SupplierRequestDto>> listSupplierRequests() {
        return ResponseEntity.ok(adminService.listPendingSupplierRequests());
    }

    @PostMapping("/supplier-requests/{id}/approve")
    public ResponseEntity<AdminSupplierDto> approveSupplier(@PathVariable Long id) {
        return ResponseEntity.ok(adminService.approveSupplier(id));
    }

    @PostMapping("/supplier-requests/{id}/reject")
    public ResponseEntity<Void> rejectSupplier(@PathVariable Long id, @RequestParam(required = false) String reason) {
        adminService.rejectSupplier(id, reason);
        return ResponseEntity.noContent().build();
    }

    // --- ORDERS ---
    @GetMapping("/orders")
    public ResponseEntity<List<AdminOrderDto>> listOrders() {
        return ResponseEntity.ok(adminService.listOrders());
    }

    @DeleteMapping("/orders/{id}")
    public ResponseEntity<Void> deleteOrder(@PathVariable Long id) {
        adminService.deleteOrder(id);
        return ResponseEntity.noContent().build();
    }

    // --- NOTIFICATIONS ---
    @GetMapping("/notifications")
    public ResponseEntity<List<NotificationDto>> listNotifications() {
        return ResponseEntity.ok(adminService.listNotifications());
    }

    @DeleteMapping("/notifications/{id}")
    public ResponseEntity<Void> deleteNotification(@PathVariable Long id) {
        adminService.deleteNotification(id);
        return ResponseEntity.noContent().build();
    }
    @PostMapping("/notifications/create")
    public ResponseEntity<NotificationDto> createNotification(@RequestBody CreateNotificationRequest req) {
        return ResponseEntity.ok(adminService.createNotification(req));
    }

}
