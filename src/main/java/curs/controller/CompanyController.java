package curs.controller;

import curs.dto.CompanyDto;
import curs.dto.CompanyRequestDto;
import curs.model.Company;
import curs.model.User;
import curs.security.JwtUtil;
import curs.service.CompanyService;
import curs.service.FileService;
import curs.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/companies")
public class CompanyController {
    private final UserService userService;
    private final CompanyService companyService;
    private final JwtUtil jwtUtil;
    private final FileService fileService;

    public CompanyController(CompanyService companyService, JwtUtil jwtUtil, UserService userService, FileService fileService) {
        this.companyService = companyService;
        this.jwtUtil = jwtUtil;
        this.userService = userService;
        this.fileService = fileService;
    }

    @PostMapping("/create")
    public ResponseEntity<?> create(@RequestHeader(value = "Authorization", required = false) String authHeader,
                                    @RequestBody CompanyDto dto) {
        Long userId = getUserIdFromHeader(authHeader);
        CompanyDto created = companyService.createCompany(userId, dto);
        return ResponseEntity.ok(created);
    }

    @GetMapping("/")
    public ResponseEntity<List<CompanyDto>> all() {
        return ResponseEntity.ok(companyService.getAll());
    }

    @GetMapping("/my")
    public CompanyDto my(@RequestHeader("Authorization") String authHeader) {
        Long userId = getUserIdFromHeader(authHeader);

        User user = userService.findById(userId);
        if (user.getCompany() == null) {
            throw new RuntimeException("User has no company");
        }

        return companyService.getById(user.getCompany().getId());
    }

    @GetMapping("/{id}")
    public ResponseEntity<CompanyDto> getOne(@PathVariable Long id) {
        return ResponseEntity.ok(companyService.getById(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<CompanyDto> update(@PathVariable Long id,
                                             @RequestBody CompanyDto dto,
                                             @RequestHeader(value = "Authorization", required = false) String authHeader) {
        Long userId = getUserIdFromHeader(authHeader);
        return ResponseEntity.ok(companyService.update(id, dto));
    }
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCompany(@PathVariable Long id,
                                              @RequestHeader(value = "Authorization", required = false) String authHeader) {
        Long userId = getUserIdFromHeader(authHeader);
        companyService.deleteCompany(id, userId);
        return ResponseEntity.noContent().build();
    }
    @PostMapping("/{companyId}/upload-logo")
    public ResponseEntity<?> uploadLogo(
            @PathVariable Long companyId,
            @RequestParam("file") MultipartFile file) {

        Company company = companyService.getEntityById(companyId);
        String logoPath = fileService.saveCompanyLogo(file, companyId);
        company.setLogoPath(logoPath);
        companyService.save(company);
        return ResponseEntity.ok(Map.of("message", "Логотип обновлён", "path", logoPath));
    }


    @PostMapping("/{companyId}/join")
    public ResponseEntity<?> join(@RequestHeader(value = "Authorization", required = false) String authHeader,
                                  @PathVariable Long companyId) {
        Long userId = getUserIdFromHeader(authHeader);
        CompanyRequestDto dto = companyService.requestJoin(userId, companyId);
        return ResponseEntity.ok(dto);
    }

    @GetMapping("/{companyId}/requests")
    public ResponseEntity<?> getPending(@RequestHeader(value = "Authorization", required = false) String authHeader,
                                        @PathVariable Long companyId) {
        Long userId = getUserIdFromHeader(authHeader);
        return ResponseEntity.ok(companyService.getPendingRequestsForCompany(companyId));
    }

    @PostMapping("/requests/{requestId}/approve")
    public ResponseEntity<?> approve(@RequestHeader(value = "Authorization", required = false) String authHeader,
                                     @PathVariable Long requestId,
                                     @RequestParam("approved") boolean approved) {
        Long userId = getUserIdFromHeader(authHeader);
        CompanyRequestDto dto = companyService.approveRequest(requestId, userId, approved);
        return ResponseEntity.ok(dto);
    }

    private Long getUserIdFromHeader(String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            throw new RuntimeException("Missing token");
        }

        String token = authHeader.substring(7).trim();
        if (!jwtUtil.validateToken(token)) {
            throw new RuntimeException("Invalid token");
        }

        return jwtUtil.extractUserId(token);
    }
}
