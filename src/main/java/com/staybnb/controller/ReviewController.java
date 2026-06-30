package com.staybnb.controller;

import com.staybnb.dto.*;
import com.staybnb.repository.UserRepository;
import com.staybnb.service.ReviewService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/reviews")
@RequiredArgsConstructor
public class ReviewController {

    private final ReviewService reviewService;
    private final UserRepository userRepository;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<ReviewResponse> create(@Valid @RequestBody ReviewRequest request) {
        Long guestId = getCurrentUserId();
        return ApiResponse.ok("Review submitted", reviewService.create(request, guestId));
    }

    @GetMapping("/listing/{listingId}")
    public ApiResponse<List<ReviewResponse>> getListingReviews(@PathVariable Long listingId) {
        return ApiResponse.ok(reviewService.getListingReviews(listingId));
    }

    private Long getCurrentUserId() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email).orElseThrow().getId();
    }
}
