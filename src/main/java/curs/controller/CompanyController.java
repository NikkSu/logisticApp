package curs.controller;

import curs.dto.CompanyDto;
import curs.dto.CompanyRequestDto;
import curs.dto.LocationDto;
import curs.model.Company;
import curs.model.User;
import curs.repo.CompanyRepository;
import curs.security.JwtUtil;
import curs.service.CompanyService;
import curs.service.FileService;
import curs.service.UserService;
import org.json.JSONArray;
import org.json.JSONObject;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.net.HttpURLConnection;
import java.net.URL;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/companies")
public class CompanyController {
    private final UserService userService;
    private final CompanyService companyService;
    private final JwtUtil jwtUtil;
    private final FileService fileService;
    private final CompanyRepository companyRepo;

    public CompanyController(CompanyService companyService, JwtUtil jwtUtil, UserService userService, FileService fileService, CompanyRepository companyRepo) {
        this.companyService = companyService;
        this.jwtUtil = jwtUtil;
        this.userService = userService;
        this.fileService = fileService;
        this.companyRepo = companyRepo;
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
    @GetMapping("/suppliers")
    public ResponseEntity<List<CompanyDto>> suppliers() {
        return ResponseEntity.ok(companyService.getAllSuppliers());
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

    @PostMapping("/{id}/geocode")
    public ResponseEntity<?> geocode(@PathVariable Long id, @RequestBody Map<String, String> body) {
        String address = body.get("address");
        if (address == null || address.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Address required"));
        }

        try {
            JSONObject geo = companyService.geocodeAddress(address);
            double lat = geo.getDouble("lat");
            double lng = geo.getDouble("lon");

            return ResponseEntity.ok(Map.of(
                    "lat", lat,
                    "lng", lng
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Not found"));
        }
    }


    @PostMapping("/{id}/location")
    public ResponseEntity<?> updateLocation(
            @PathVariable Long id,
            @RequestBody LocationDto coords

    ) {
        Double lat = coords.getLat();
        Double lng = coords.getLng();

        Company company = companyRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Company not found"));

        company.setLatitude(lat);
        company.setLongitude(lng);

        // Обратное геокодирование
        String address = reverseGeocodeNominatim(lat, lng);
        if (address != null) company.setAddress(address);

        companyRepo.save(company);

        return ResponseEntity.ok(Map.of(
                "address", company.getAddress(),
                "lat", lat,
                "lng", lng
        ));
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
    public String reverseGeocodeNominatim(Double lat, Double lng) {
        try {
            String urlStr = "https://nominatim.openstreetmap.org/reverse?" +
                    "format=json&lat=" + lat + "&lon=" + lng + "&zoom=18&addressdetails=1";

            URL url = new URL(urlStr);
            HttpURLConnection conn = (HttpURLConnection) url.openConnection();

            conn.setRequestMethod("GET");
            conn.setRequestProperty("User-Agent", "Mozilla/5.0"); // <-- ОБЯЗАТЕЛЬНО

            if (conn.getResponseCode() != 200) {
                return null;
            }

            String jsonStr = new String(conn.getInputStream().readAllBytes(), StandardCharsets.UTF_8);

            JSONObject json = new JSONObject(jsonStr);
            if (json.has("display_name")) {
                return json.getString("display_name");
            }

        } catch (Exception e) {
            e.printStackTrace();
        }

        return null;
    }

}

