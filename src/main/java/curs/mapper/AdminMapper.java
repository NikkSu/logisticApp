package curs.mapper;

import curs.dto.*;
import curs.model.*;
import curs.model.SupplierRequest;
import curs.model.enums.Role;
import org.springframework.stereotype.Component;

@Component
public class AdminMapper {

    public AdminUserDto toAdminUserDto(User u) {
        AdminUserDto dto = new AdminUserDto();
        dto.setId(u.getId());
        dto.setUsername(u.getUsername());
        dto.setEmail(u.getEmail());
        dto.setRole(u.getRole().name());
        dto.setCompanyId(u.getCompany() != null ? u.getCompany().getId() : null);
        dto.setAvatarPath(u.getAvatarPath());
        return dto;
    }
        public User toUser(AdminUserDto dto) {
        User user = new User();
        user.setId(dto.getId());
        user.setUsername(dto.getUsername());
        user.setEmail(dto.getEmail());
        user.setRole(Role.valueOf(dto.getRole()));
        user.setAvatarPath(dto.getAvatarPath());
        user.setPassword(dto.getPassword());
        return user;
        }
    public CompanyDto toCompanyDto(Company c) {
        CompanyDto dto = new CompanyDto();
        dto.setId(c.getId());
        dto.setName(c.getName());
        dto.setAddress(c.getAddress());
        dto.setDescription(c.getDescription());
        dto.setLogoPath(c.getLogoPath());
        dto.setOwnerId(c.getOwner() != null ? c.getOwner().getId() : null);
        dto.setOwnerName(c.getOwner().getUsername() != null ? c.getOwner().getUsername() : null);
        return dto;
    }

    public AdminSupplierDto toAdminSupplierDto(Supplier s) {
        AdminSupplierDto dto = new AdminSupplierDto();
        dto.setId(s.getId());
        dto.setCompanyName(s.getCompanyName());
        dto.setInn(s.getInn());
        dto.setStatus(s.getStatus() != null ? s.getStatus().name() : null);
        dto.setUserId(s.getUser() != null ? s.getUser().getId() : null);
        return dto;
    }

    public SupplierRequestDto toSupplierRequestDto(SupplierRequest sr) {
        SupplierRequestDto dto = new SupplierRequestDto();
        dto.setId(sr.getId());
        dto.setUserId(sr.getUser() != null ? sr.getUser().getId() : null);
        dto.setCompanyName(sr.getCompanyName());
        dto.setInn(sr.getInn());
        dto.setPhone(sr.getPhone());
        dto.setWebsite(sr.getWebsite());
        return dto;
    }

    public AdminOrderDto toAdminOrderDto(Order o) {
        AdminOrderDto dto = new AdminOrderDto();
        dto.setId(o.getId());
        dto.setDate(o.getDate() != null ? o.getDate().toString() : null);
        dto.setTotalSum(o.getTotalSum());
        dto.setStatus(o.getStatus() != null ? o.getStatus().name() : null);
        dto.setCompanyId(o.getCompany() != null ? o.getCompany().getId() : null);
        dto.setUserId(o.getUser() != null ? o.getUser().getId() : null);
        return dto;
    }

    public NotificationDto toNotificationDto(Notification n) {
        NotificationDto dto = new NotificationDto();
        dto.setId(n.getId());
        dto.setMessage(n.getMessage());
        dto.setRead(n.isRead());
        dto.setCreatedAt(n.getCreatedAt());

        if (n.getUser() != null) {
            dto.setUserId(n.getUser().getId());
            dto.setUsername(n.getUser().getUsername());
        } else {
            dto.setUserId(null);
            dto.setUsername(null);
        }

        return dto;
    }


}
