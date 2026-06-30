package com.staybnb.service;

import com.staybnb.dto.*;
import com.staybnb.exception.BadRequestException;
import com.staybnb.exception.ConflictException;
import com.staybnb.exception.ResourceNotFoundException;
import com.staybnb.model.*;
import com.staybnb.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final ListingRepository listingRepository;
    private final UserRepository userRepository;
    private final BookingRepository bookingRepository;

    @Transactional
    public ReviewResponse create(ReviewRequest request, Long guestId) {
        Listing listing = listingRepository.findById(request.getListingId())
                .orElseThrow(() -> new ResourceNotFoundException("Listing not found"));
        User guest = userRepository.findById(guestId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        // Must have completed a booking
        if (!bookingRepository.hasCompletedBooking(request.getListingId(), guestId)) {
            throw new BadRequestException("You can only review listings you have stayed at");
        }

        // No duplicate reviews
        if (reviewRepository.findByListingIdAndGuestId(request.getListingId(), guestId).isPresent()) {
            throw new ConflictException("You have already reviewed this listing");
        }

        Review review = Review.builder()
                .listing(listing)
                .guest(guest)
                .rating(request.getRating())
                .comment(request.getComment())
                .build();
        review = reviewRepository.save(review);

        // Update average rating on listing
        double avg = reviewRepository.calculateAverageRating(listing.getId()).orElse(0.0);
        listing.setAverageRating(Math.round(avg * 10.0) / 10.0);
        listingRepository.save(listing);

        return mapToResponse(review);
    }

    public List<ReviewResponse> getListingReviews(Long listingId) {
        return reviewRepository.findByListingIdOrderByCreatedAtDesc(listingId)
                .stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    private ReviewResponse mapToResponse(Review r) {
        return ReviewResponse.builder()
                .id(r.getId())
                .listingId(r.getListing().getId())
                .guestId(r.getGuest().getId())
                .guestName(r.getGuest().getFirstName() + " " + r.getGuest().getLastName())
                .guestAvatar(r.getGuest().getAvatarUrl())
                .rating(r.getRating())
                .comment(r.getComment())
                .createdAt(r.getCreatedAt())
                .build();
    }
}
