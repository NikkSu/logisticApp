package curs.controller;

import curs.dto.UserLoginDTO;
import curs.dto.UserRegisterDTO;
import curs.dto.UserResponseDTO;
import curs.model.User;
import curs.repo.UserRepository;
import curs.security.JwtUtil;
import curs.service.AuthService;
import curs.service.EmailService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import org.springframework.web.bind.annotation.*;
import java.util.*;



@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:3000")
public class AuthController {

    private final AuthService authService;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;
    private final JwtUtil jwtUtil;

    @Autowired
    public AuthController(UserRepository userRepository,
                          PasswordEncoder passwordEncoder,
                          EmailService emailService,
                          AuthService authService,
                          JwtUtil jwtUtil) {
        this.jwtUtil = jwtUtil;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.emailService = emailService;
        this.authService = authService;
    }
    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        Optional<User> user = userRepository.findByEmail(email);

        if (user.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "Пользователь не найден"));
        }

        String newPass = UUID.randomUUID().toString().substring(0, 8);
        user.get().setPassword(passwordEncoder.encode(newPass));
        userRepository.save(user.get());

        emailService.sendNewPassword(email, newPass);

        return ResponseEntity.ok(Map.of("message", "Новый пароль отправлен на почту"));
    }


    @PostMapping("/register")
    public ResponseEntity<Map<String, String>> register(@RequestBody UserRegisterDTO dto) {
        User user = authService.register(dto);
        String token = jwtUtil.generateToken(user.getId(),user.getEmail(), user.getUsername(), String.valueOf(user.getRole()));
        return ResponseEntity.ok(Map.of("token", token));
    }


    @PostMapping("/login")
    public ResponseEntity<Map<String, String>> login(@RequestBody UserLoginDTO dto) {
        String token = authService.login(dto);
        return ResponseEntity.ok(Map.of("token", token));
    }

}
