package curs.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.ViewControllerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.nio.file.Path;
import java.nio.file.Paths;

@Configuration
public class WebConfig implements WebMvcConfigurer {
    @Override
    public void addViewControllers(ViewControllerRegistry registry) {
        registry.addViewController("/{spring:[a-zA-Z0-9-_]+}")
                .setViewName("forward:/index.html");
        registry.addViewController("/**/{spring:[a-zA-Z0-9-_]+}")
                .setViewName("forward:/index.html");
        registry.addViewController("/{spring:[a-zA-Z0-9-_]+}/**{spring:?!(\\.js|\\.css)$}")
                .setViewName("forward:/index.html");
    }
    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        Path uploadDir = Paths.get(System.getProperty("user.dir"), "uploads");
        String uploadPath = uploadDir.toFile().getAbsolutePath();

        System.out.println("📂 Настроен доступ к статическим файлам: " + uploadPath);

        registry.addResourceHandler("/uploads/**")
                .addResourceLocations("file:" + uploadPath + "/");
    }
}
