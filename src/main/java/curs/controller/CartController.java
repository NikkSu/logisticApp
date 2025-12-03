package curs.controller;

import curs.dto.CartItemDto;
import curs.mapper.CartItemMapper;
import curs.model.CartItem;
import curs.repo.CartItemRepository;
import curs.repo.UserRepository;
import curs.service.CartService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;


@RestController
@RequestMapping("/api/cart")
@RequiredArgsConstructor
public class CartController {

    private final UserRepository userRepository;
    private final CartService service;
    private final CartItemMapper cartItemMapper;

    private Long getUserId(Principal p) {
        return userRepository.findByUsername(p.getName())
                .orElseThrow(() -> new RuntimeException("User not found"))
                .getId();
    }

    @GetMapping
    public List<CartItemDto> get(Principal p) {
        Long userId = getUserId(p);
        return service.getCart(userId).stream()
                .map(cartItemMapper::toDto)
                .toList();
    }

    @PostMapping("/add/{productId}")
    public void add(@PathVariable Long productId, Principal p) {
        service.add(getUserId(p), productId);
    }

    @DeleteMapping("/remove/{productId}")
    public void remove(@PathVariable Long productId, Principal p) {
        service.remove(getUserId(p), productId);
    }

    @DeleteMapping("/clear")
    public void clear(Principal p) {
        service.clear(getUserId(p));
    }
    @PostMapping("/set")
    public List<CartItemDto> setQuantity(
            @RequestParam Long productId,
            @RequestParam Integer quantity,
            Principal p
    ) {
        Long userId = getUserId(p);
        return service.setQuantity(userId, productId, quantity)
                .stream()
                .map(cartItemMapper::toDto)
                .toList();
    }


}
