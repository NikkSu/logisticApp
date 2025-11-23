package curs.service;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.*;

@Service
public class FileService {
    private final Path uploadRoot = Paths.get("uploads");
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

    public String saveSupplierLogo(MultipartFile file, Long supplierId) {
        try {
            String ext = getExtension(file.getOriginalFilename());
            String filename = "supplier_" + supplierId + "_" + System.currentTimeMillis() + ext;

            Path dir = uploadRoot.resolve("supplier-logos");
            Files.createDirectories(dir);

            Files.copy(file.getInputStream(), dir.resolve(filename), StandardCopyOption.REPLACE_EXISTING);

            return "/uploads/supplier-logos/" + filename;
        } catch (IOException e) {
            throw new RuntimeException("Ошибка при сохранении логотипа поставщика", e);
        }
    }
    public String saveProductImage(MultipartFile file, Long productId) {
        try {
            String ext = getExtension(file.getOriginalFilename());
            String filename = "product_" + productId + "_" + System.currentTimeMillis() + ext;

            Path dir = uploadRoot.resolve("products");
            Files.createDirectories(dir);

            Files.copy(file.getInputStream(), dir.resolve(filename), StandardCopyOption.REPLACE_EXISTING);

            return "/uploads/products/" + filename;
        } catch (IOException e) {
            throw new RuntimeException("Ошибка при сохранении изображения продукта", e);
        }
    }
    private String getExtension(String name) {
        int i = name.lastIndexOf('.');
        return i > 0 ? name.substring(i) : "";
    }

}
