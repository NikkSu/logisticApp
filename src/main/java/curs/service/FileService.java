package curs.service;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.*;

@Service
public class FileService {

    private final Path uploadDir = Paths.get("uploads/avatars");

    public FileService() {
        try {
            if (!Files.exists(uploadDir)) {
                Files.createDirectories(uploadDir);
                System.out.println("✅ Создан каталог: " + uploadDir.toAbsolutePath());
            } else {
                System.out.println("📁 Каталог уже существует: " + uploadDir.toAbsolutePath());
            }
        } catch (IOException e) {
            throw new RuntimeException("Не удалось создать каталог для загрузки файлов", e);
        }
    }

    public String saveAvatar(MultipartFile file, Long userId) throws IOException {
        String ext = "";

        String originalName = file.getOriginalFilename();
        if (originalName != null && originalName.contains(".")) {
            ext = originalName.substring(originalName.lastIndexOf('.'));
        }

        String filename = "user_" + userId + ext;
        Path filePath = uploadDir.resolve(filename);

        Files.write(filePath, file.getBytes(), StandardOpenOption.CREATE, StandardOpenOption.TRUNCATE_EXISTING);
        return "/uploads/avatars/" + filename;
    }
    public String saveCompanyLogo(MultipartFile file, Long companyId) {
        String folder = "company-logos";
        String filename = "company_" + companyId + "_" + System.currentTimeMillis() + getExtension(file.getOriginalFilename());
        Path uploadPath = Paths.get("uploads").resolve(folder);
        try {
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }
            Path filePath = uploadPath.resolve(filename);
            Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);
            return "/uploads/" + folder + "/" + filename;
        } catch (IOException e) {
            throw new RuntimeException("Ошибка при сохранении файла: " + e.getMessage());
        }
    }

    private String getExtension(String name) {
        int i = name.lastIndexOf('.');
        return i > 0 ? name.substring(i) : "";
    }

}
