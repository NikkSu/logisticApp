package curs.service;

import curs.dto.CompanyDto;
import curs.dto.CompanyRequestDto;
import curs.mapper.CompanyMapper;
import curs.mapper.CompanyRequestMapper;
import curs.model.*;
import curs.model.enums.CompanyRequestStatus;
import curs.repo.CompanyRepository;
import curs.repo.CompanyRequestRepository;
import curs.repo.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class CompanyService {

    private final CompanyRepository companyRepository;
    private final UserRepository userRepository;
    private final CompanyMapper companyMapper;
    private final CompanyRequestRepository companyRequestRepository;
    private final CompanyRequestMapper companyRequestMapper;
    private final NotificationService notificationService;

    public CompanyService(CompanyRepository companyRepository,
                          UserRepository userRepository,
                          CompanyMapper companyMapper,
                          CompanyRequestRepository companyRequestRepository,
                          CompanyRequestMapper companyRequestMapper,
                          NotificationService notificationService) {
        this.companyRepository = companyRepository;
        this.userRepository = userRepository;
        this.companyMapper = companyMapper;
        this.companyRequestRepository = companyRequestRepository;
        this.companyRequestMapper = companyRequestMapper;
        this.notificationService = notificationService;
    }

    @Transactional
    public CompanyDto createCompany(Long userId, CompanyDto dto) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        if (companyRepository.existsByNameIgnoreCase(dto.getName())) {
            throw new RuntimeException("Компания с таким именем уже существует");
        }
        Company company = new Company();
        company.setName(dto.getName());
        company.setAddress(dto.getAddress());
        company.setDescription(dto.getDescription());
        company.setOwner(user);
        companyRepository.save(company);

        user.setCompany(company);
        userRepository.save(user);

        return companyMapper.toDto(company);
    }



    public List<CompanyDto> getAll() {
        return companyRepository.findAll().stream().map(companyMapper::toDto).collect(Collectors.toList());
    }

    public CompanyDto getById(Long id) {
        Company company = companyRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Company not found"));

        CompanyDto dto = new CompanyDto();
        dto.setId(company.getId());
        dto.setName(company.getName());
        dto.setAddress(company.getAddress());
        dto.setDescription(company.getDescription());
        dto.setLogoPath(company.getLogoPath());
        dto.setOwnerId(company.getOwner() != null ? company.getOwner().getId() : null);

        return dto;
    }

    @Transactional
    public CompanyDto update(Long id, CompanyDto dto) {
        Company exists = companyRepository.findById(id).orElseThrow();
        companyMapper.updateEntity(exists, dto);
        return companyMapper.toDto(companyRepository.save(exists));
    }
    @Transactional
    public void leaveCompany(Long userId, Long companyId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        if (user.getCompany() == null || !user.getCompany().getId().equals(companyId)) {
            throw new RuntimeException("User is not part of this company");
        }
        user.setCompany(null);
        userRepository.save(user);
    }

    @Transactional
    public void deleteCompany(Long companyId, Long userId) {
        Company company = companyRepository.findById(companyId)
                .orElseThrow(() -> new RuntimeException("Компания не найдена"));

        if (!company.getOwner().getId().equals(userId)) {
            throw new RuntimeException("Только владелец компании может удалить её");
        }

        companyRequestRepository.deleteAllByCompanyId(companyId);

        List<User> users = userRepository.findByCompanyId(companyId);
        for (User u : users) {
            u.setCompany(null);
            userRepository.save(u);
            notificationService.createNotification(
                    u.getId(),
                    "Компания \"" + company.getName() + "\" была удалена владельцем."
            );
        }

        companyRepository.delete(company);
    }


    public List<CompanyRequestDto> getPendingRequestsForCompany(Long companyId) {
        return companyRequestRepository.findByCompanyIdAndStatus(companyId, CompanyRequestStatus.PENDING)
                .stream().map(companyRequestMapper::toDto).collect(Collectors.toList());
    }

    @Transactional
    public CompanyRequestDto requestJoin(Long userId, Long companyId) {
        User user = userRepository.findById(userId).orElseThrow();
        Company company = companyRepository.findById(companyId).orElseThrow();

        if (companyRequestRepository.existsByRequesterAndCompany(user, company)) {
            throw new RuntimeException("Заявка уже подана");
        }

        CompanyRequest req = new CompanyRequest();
        req.setRequester(user);
        req.setCompany(company);
        req.setStatus(CompanyRequestStatus.PENDING);
        req = companyRequestRepository.save(req);

        if (company.getOwner() != null) {
            notificationService.createNotification(
                    company.getOwner().getId(),
                    "Новая заявка от пользователя " + user.getUsername() +
                            " на вступление в компанию \"" + company.getName() + "\""
            );
        }

        return companyRequestMapper.toDto(req);
    }

    @Transactional
    public CompanyRequestDto approveRequest(Long requestId, Long actingUserId, boolean approved) {
        CompanyRequest req = companyRequestRepository.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Request not found"));

        Company company = req.getCompany();
        User owner = company.getOwner();
        User requester = req.getRequester();

        if (owner == null || !owner.getId().equals(actingUserId)) {
            throw new SecurityException("Only company owner can approve or reject requests");
        }

        if (approved) {
            req.setStatus(CompanyRequestStatus.APPROVED);
            requester.setCompany(company);
            userRepository.save(requester);
            notificationService.createNotification(
                    requester.getId(),
                    "Ваша заявка на вступление в компанию \"" + company.getName() + "\" была одобрена."
            );
        } else {
            req.setStatus(CompanyRequestStatus.REJECTED);

            notificationService.createNotification(
                    requester.getId(),
                    "Ваша заявка на вступление в компанию \"" + company.getName() + "\" была отклонена."
            );
        }

        return companyRequestMapper.toDto(companyRequestRepository.save(req));
    }
    public Company getEntityById(Long id) {
        return companyRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Company not found"));
    }

    public void save(Company company) {
        companyRepository.save(company);
    }
}
