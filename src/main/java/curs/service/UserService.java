package curs.service;

import curs.mapper.UserMapper;
import curs.model.User;
import curs.repo.UserRepository;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

import curs.dto.UserDTO;

@Service
public class UserService {
    private final UserRepository userRepository;
    private final CompanyService companyService;
    @Autowired
    private PasswordEncoder passwordEncoder;

    public UserService(UserRepository userRepository, CompanyService companyService) {
        this.userRepository = userRepository;
        this.companyService = companyService;
    }

    public List<User> getAll() { return userRepository.findAll(); }

    public UserDTO getById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));

        UserDTO dto = new UserDTO();
        dto.setId(user.getId());
        dto.setUsername(user.getUsername());
        dto.setEmail(user.getEmail());
        dto.setRole(user.getRole());

        dto.setAvatarPath(user.getAvatarPath());

        if (user.getCompany() != null) {
            dto.setCompany(companyService.getById(user.getCompany().getId()));
            dto.setCompanyId(user.getCompany().getId());
            dto.setCompanyName(user.getCompany().getName());
        } else {
            dto.setCompany(null);
            dto.setCompanyId(null);
            dto.setCompanyName(null);
        }

        return dto;
    }
    public User findByUsername(String username) {
        return userRepository.getByUsername(username);
    }
    public User findById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    @Transactional
    public UserDTO leaveCompany(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));

        user.setCompany(null);
        userRepository.save(user);

        return UserMapper.toDto(user);
    }
    public User createUser(User u) {
        if (u.getPassword() == null || u.getPassword().isBlank()) {
            u.setPassword(passwordEncoder.encode("123456")); // default password
        }
        return userRepository.save(u);
    }
    public Long getUserIdByPrincipal(String principalName) {
        return userRepository.findByUsername(principalName)
                .map(User::getId)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }


}
