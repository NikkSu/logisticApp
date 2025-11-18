package curs.service;

import curs.mapper.UserMapper;
import curs.model.User;
import curs.repo.UserRepository;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;
import java.util.List;

import curs.dto.UserDTO;

@Service
public class UserService {
    private final UserRepository userRepository;
    private final CompanyService companyService;
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
        return userRepository.findByUsername(username);
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
    public User create(User u) { return userRepository.save(u); }

}
