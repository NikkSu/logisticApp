package curs.security;

import curs.model.User;
import curs.model.enums.Role;
import curs.repo.UserRepository;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.util.Map;

@Component
@RequiredArgsConstructor
public class OAuth2SuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

    private final JwtUtil jwtUtil;
    private final UserRepository userRepository;

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request,
                                        HttpServletResponse response,
                                        Authentication authentication) throws IOException {

        OAuth2User oauthUser = (OAuth2User) authentication.getPrincipal();
        Map<String, Object> attributes = oauthUser.getAttributes();

        // Определяем источник (Google или Discord)
        String client = request.getRequestURI().contains("google") ? "google" : "discord";

        String email;
        String username;

        if ("google".equals(client)) {
            email = (String) attributes.get("email");
            username = (String) attributes.getOrDefault("name", email);
        } else { // discord
            email = (String) attributes.getOrDefault("email", "no-email-" + attributes.get("id") + "@discord.local");
            username = (String) attributes.getOrDefault("username", "discordUser");
        }

        User user = userRepository.findByEmail(email)
                .orElseGet(() -> {
                    User newUser = new User();
                    newUser.setEmail(email);
                    newUser.setUsername(username);
                    newUser.setRole(Role.USER);
                    newUser.setPassword("");
                    return userRepository.save(newUser);
                });

        String token = jwtUtil.generateToken(user.getId(), email, username, user.getRole().name());

        // Редиректим на фронт с токеном
        String redirectUrl = "http://localhost:3000/oauth-success?token=" + token;
        response.sendRedirect(redirectUrl);
    }
}
