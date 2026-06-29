package com.staybnb.controller;

import com.staybnb.dto.*;
import com.staybnb.repository.UserRepository;
import com.staybnb.service.BookingService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/bookings")
@RequiredArgsConstructor
public class BookingController {

    private final BookingService bookingService;
    private final UserRepository userRepository;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<BookingResponse> create(@Valid @RequestBody BookingRequest request) {
        Long guestId = getCurrentUserId();
        return ApiResponse.ok("Booking created", bookingService.create(request, guestId));
    }

    @GetMapping("/my")
    public ApiResponse<List<BookingResponse>> myBookings() {
        Long guestId = getCurrentUserId();
        return ApiResponse.ok(bookingService.getGuestBookings(guestId));
    }

    @GetMapping("/host")
    public ApiResponse<List<BookingResponse>> hostBookings() {
        Long hostId = getCurrentUserId();
        return ApiResponse.ok(bookingService.getHostBookings(hostId));
    }

    @PutMapping("/{id}/status")
    public ApiResponse<BookingResponse> updateStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {
        Long userId = getCurrentUserId();
        String status = body.get("status");
        return ApiResponse.ok("Status updated", bookingService.updateStatus(id, status, userId));
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> cancel(@PathVariable Long id) {
        Long userId = getCurrentUserId();
        bookingService.cancel(id, userId);
        return ApiResponse.ok("Booking cancelled", null);
    }

    private Long getCurrentUserId() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email).orElseThrow().getId();
    }
}
