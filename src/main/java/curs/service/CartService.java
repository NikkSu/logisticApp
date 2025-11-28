package curs.service;

import curs.model.CartItem;
import curs.model.Product;
import curs.repo.CartItemRepository;
import curs.repo.ProductRepository;
import curs.repo.UserRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CartService {

    private final CartItemRepository cartRepo;
    private final ProductRepository productRepo;
    private final UserRepository userRepo;

    public List<CartItem> getCart(Long userId) {
        return cartRepo.findAllByUserId(userId);
    }

    @Transactional
    public List<CartItem> setQuantity(Long userId, Long productId, int quantity) {

        Product product = productRepo.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        CartItem item = cartRepo.findByUserIdAndProductId(userId, productId)
                .orElse(null);

        if (item == null)
            return getCart(userId);

        if (quantity <= 0) {
            cartRepo.delete(item);
        } else {
            item.setQuantity(quantity);
            cartRepo.save(item);
        }

        return getCart(userId);
    }

    @Transactional
    public void add(Long userId, Long productId) {
        Product p = productRepo.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        CartItem item = cartRepo.findByUserIdAndProductId(userId, productId)
                .orElse(null);

        if (item == null) {
            item = new CartItem();
            item.setProduct(p);
            item.setUser(userRepo.getReferenceById(userId));
            item.setQuantity(1);
        } else {
            item.setQuantity(item.getQuantity() + 1);
        }

        cartRepo.save(item);
    }

    @Transactional
    public void remove(Long userId, Long productId) {
        CartItem item = cartRepo.findByUserIdAndProductId(userId, productId)
                .orElse(null);

        if (item != null)
            cartRepo.delete(item);
    }

    public void clear(Long userId) {
        cartRepo.deleteAllByUserId(userId);
    }
}
