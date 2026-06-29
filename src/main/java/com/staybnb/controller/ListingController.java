package com.staybnb.controller;

import com.staybnb.dto.*;
import com.staybnb.model.User;
import com.staybnb.repository.UserRepository;
import com.staybnb.service.ListingService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;

@RestController
@RequestMapping("/api/listings")
@RequiredArgsConstructor
public class ListingController {

    private final ListingService listingService;
    private final UserRepository userRepository;

    @GetMapping
    public ApiResponse<Page<ListingResponse>> search(
            @RequestParam(required = false) String city,
            @RequestParam(required = false) String country,
            @RequestParam(required = false) BigDecimal minPrice,
            @RequestParam(required = false) BigDecimal maxPrice,
            @RequestParam(required = false) Integer guests,
            @RequestParam(required = false) String propertyType,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size,
            @RequestParam(defaultValue = "createdAt") String sort) {

        return ApiResponse.ok(listingService.searchListings(
                city, country, minPrice, maxPrice, guests, propertyType, page, size, sort));
    }

    @GetMapping("/{id}")
    public ApiResponse<ListingResponse> getById(@PathVariable Long id) {
        return ApiResponse.ok(listingService.getById(id));
    }

    @GetMapping("/my")
    public ApiResponse<Page<ListingResponse>> myListings(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size) {
        Long hostId = getCurrentUserId();
        return ApiResponse.ok(listingService.getHostListings(hostId, page, size));
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<ListingResponse> create(@Valid @RequestBody ListingRequest request) {
        Long hostId = getCurrentUserId();
        return ApiResponse.ok("Listing created", listingService.create(request, hostId));
    }

    @PutMapping("/{id}")
    public ApiResponse<ListingResponse> update(
            @PathVariable Long id,
            @Valid @RequestBody ListingRequest request) {
        Long hostId = getCurrentUserId();
        return ApiResponse.ok("Listing updated", listingService.update(id, request, hostId));
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        Long hostId = getCurrentUserId();
        listingService.softDelete(id, hostId);
        return ApiResponse.ok("Listing deleted", null);
    }

    private Long getCurrentUserId() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email).orElseThrow().getId();
    }
}
