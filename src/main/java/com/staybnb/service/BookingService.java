package com.staybnb.service;

import com.staybnb.dto.*;
import com.staybnb.exception.BadRequestException;
import com.staybnb.exception.ForbiddenException;
import com.staybnb.exception.ResourceNotFoundException;
import com.staybnb.model.Booking;
import com.staybnb.model.Listing;
import com.staybnb.model.User;
import com.staybnb.repository.BookingRepository;
import com.staybnb.repository.ListingRepository;
import com.staybnb.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BookingService {

    private final BookingRepository bookingRepository;
    private final ListingRepository listingRepository;
    private final UserRepository userRepository;
    private final EmailService emailService;

    @Transactional
    public BookingResponse create(BookingRequest request, Long guestId) {
        if (!request.getCheckOut().isAfter(request.getCheckIn())) {
            throw new BadRequestException("Check-out must be after check-in");
        }

        Listing listing = listingRepository.findById(request.getListingId())
                .orElseThrow(() -> new ResourceNotFoundException("Listing not found"));

        if (!listing.getIsActive()) {
            throw new BadRequestException("Listing is not available");
        }
        if (listing.getHost().getId().equals(guestId)) {
            throw new BadRequestException("You cannot book your own listing");
        }
        if (request.getNumGuests() > listing.getMaxGuests()) {
            throw new BadRequestException("Number of guests exceeds the listing's max capacity");
        }

        boolean conflict = bookingRepository.existsConflictingBooking(
                request.getListingId(), request.getCheckIn(), request.getCheckOut());
        if (conflict) {
            throw new BadRequestException("These dates are already booked");
        }

        User guest = userRepository.findById(guestId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        long nights = ChronoUnit.DAYS.between(request.getCheckIn(), request.getCheckOut());
        BigDecimal totalPrice = listing.getPricePerNight().multiply(BigDecimal.valueOf(nights));

        Booking booking = Booking.builder()
                .listing(listing)
                .guest(guest)
                .checkIn(request.getCheckIn())
                .checkOut(request.getCheckOut())
                .totalPrice(totalPrice)
                .numGuests(request.getNumGuests())
                .build();

        Booking savedBooking = bookingRepository.save(booking);

        // Send Email Notification
        emailService.sendBookingConfirmation(
                guest.getEmail(),
                guest.getFirstName(),
                listing.getTitle(),
                request.getCheckIn().toString(),
                request.getCheckOut().toString(),
                totalPrice
        );

        return mapToResponse(savedBooking);
    }

    public List<BookingResponse> getGuestBookings(Long guestId) {
        return bookingRepository.findByGuestIdOrderByCreatedAtDesc(guestId)
                .stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    public List<BookingResponse> getHostBookings(Long hostId) {
        return bookingRepository.findByHostIdOrderByCreatedAtDesc(hostId)
                .stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    @Transactional
    public BookingResponse updateStatus(Long bookingId, String status, Long userId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found"));

        boolean isHost = booking.getListing().getHost().getId().equals(userId);
        boolean isGuest = booking.getGuest().getId().equals(userId);

        if (!isHost && !isGuest) {
            throw new ForbiddenException("Access denied");
        }

        Booking.BookingStatus newStatus;
        try {
            newStatus = Booking.BookingStatus.valueOf(status.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new BadRequestException("Invalid status: " + status);
        }

        // Guests can only cancel; hosts can confirm/cancel/complete
        if (isGuest && newStatus != Booking.BookingStatus.CANCELLED) {
            throw new ForbiddenException("Guests can only cancel bookings");
        }

        booking.setStatus(newStatus);
        return mapToResponse(bookingRepository.save(booking));
    }

    @Transactional
    public void cancel(Long bookingId, Long userId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found"));

        boolean isHost = booking.getListing().getHost().getId().equals(userId);
        boolean isGuest = booking.getGuest().getId().equals(userId);

        if (!isHost && !isGuest) {
            throw new ForbiddenException("Access denied");
        }

        booking.setStatus(Booking.BookingStatus.CANCELLED);
        bookingRepository.save(booking);
    }

    private BookingResponse mapToResponse(Booking b) {
        String firstImage = b.getListing().getImageUrls().isEmpty()
                ? null : b.getListing().getImageUrls().get(0);
        return BookingResponse.builder()
                .id(b.getId())
                .listingId(b.getListing().getId())
                .listingTitle(b.getListing().getTitle())
                .listingCity(b.getListing().getCity())
                .listingImage(firstImage)
                .listingPricePerNight(b.getListing().getPricePerNight())
                .guestId(b.getGuest().getId())
                .guestName(b.getGuest().getFirstName() + " " + b.getGuest().getLastName())
                .checkIn(b.getCheckIn())
                .checkOut(b.getCheckOut())
                .totalPrice(b.getTotalPrice())
                .numGuests(b.getNumGuests())
                .status(b.getStatus().name())
                .createdAt(b.getCreatedAt())
                .build();
    }
}
