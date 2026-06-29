package com.staybnb.service;

import com.staybnb.dto.*;
import com.staybnb.exception.BadRequestException;
import com.staybnb.exception.ForbiddenException;
import com.staybnb.exception.ResourceNotFoundException;
import com.staybnb.model.Listing;
import com.staybnb.model.User;
import com.staybnb.repository.ListingRepository;
import com.staybnb.repository.ReviewRepository;
import com.staybnb.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ListingService {

    private final ListingRepository listingRepository;
    private final UserRepository userRepository;
    private final ReviewRepository reviewRepository;

    public Page<ListingResponse> searchListings(
            String city, String country,
            BigDecimal minPrice, BigDecimal maxPrice,
            Integer guests, String propertyType,
            int page, int size, String sort) {

        Sort sortObj = switch (sort != null ? sort : "createdAt") {
            case "price_asc"  -> Sort.by("pricePerNight").ascending();
            case "price_desc" -> Sort.by("pricePerNight").descending();
            case "rating"     -> Sort.by("averageRating").descending();
            default            -> Sort.by("createdAt").descending();
        };

        Pageable pageable = PageRequest.of(page, size, sortObj);
        Page<Listing> listings = listingRepository.searchListings(
                city, country, minPrice, maxPrice, guests, propertyType, pageable);

        return listings.map(this::mapToResponse);
    }

    public ListingResponse getById(Long id) {
        Listing listing = listingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Listing not found"));
        if (!listing.getIsActive()) {
            throw new ResourceNotFoundException("Listing not found");
        }
        return mapToResponse(listing);
    }

    @Transactional
    public ListingResponse create(ListingRequest request, Long hostId) {
        User host = userRepository.findById(hostId)
                .orElseThrow(() -> new BadRequestException("User not found"));

        Listing listing = Listing.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .propertyType(Listing.PropertyType.valueOf(request.getPropertyType().toUpperCase()))
                .pricePerNight(request.getPricePerNight())
                .maxGuests(request.getMaxGuests())
                .bedrooms(request.getBedrooms())
                .bathrooms(request.getBathrooms())
                .address(request.getAddress())
                .city(request.getCity())
                .country(request.getCountry())
                .latitude(request.getLatitude())
                .longitude(request.getLongitude())
                .amenities(request.getAmenities() != null ? request.getAmenities() : new ArrayList<>())
                .imageUrls(request.getImageUrls() != null ? request.getImageUrls() : new ArrayList<>())
                .host(host)
                .build();

        return mapToResponse(listingRepository.save(listing));
    }

    @Transactional
    public ListingResponse update(Long id, ListingRequest request, Long hostId) {
        Listing listing = listingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Listing not found"));
        if (!listing.getHost().getId().equals(hostId)) {
            throw new ForbiddenException("You don't own this listing");
        }

        listing.setTitle(request.getTitle());
        listing.setDescription(request.getDescription());
        listing.setPropertyType(Listing.PropertyType.valueOf(request.getPropertyType().toUpperCase()));
        listing.setPricePerNight(request.getPricePerNight());
        listing.setMaxGuests(request.getMaxGuests());
        listing.setBedrooms(request.getBedrooms());
        listing.setBathrooms(request.getBathrooms());
        listing.setAddress(request.getAddress());
        listing.setCity(request.getCity());
        listing.setCountry(request.getCountry());
        listing.setLatitude(request.getLatitude());
        listing.setLongitude(request.getLongitude());
        if (request.getAmenities() != null) listing.setAmenities(request.getAmenities());
        if (request.getImageUrls() != null) listing.setImageUrls(request.getImageUrls());

        return mapToResponse(listingRepository.save(listing));
    }

    @Transactional
    public void softDelete(Long id, Long hostId) {
        Listing listing = listingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Listing not found"));
        if (!listing.getHost().getId().equals(hostId)) {
            throw new ForbiddenException("You don't own this listing");
        }
        listing.setIsActive(false);
        listingRepository.save(listing);
    }

    public Page<ListingResponse> getHostListings(Long hostId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        return listingRepository.findByHostIdAndIsActiveTrue(hostId, pageable).map(this::mapToResponse);
    }

    public ListingResponse mapToResponse(Listing listing) {
        long reviewCount = reviewRepository.countByListingId(listing.getId());
        return ListingResponse.builder()
                .id(listing.getId())
                .title(listing.getTitle())
                .description(listing.getDescription())
                .propertyType(listing.getPropertyType().name())
                .pricePerNight(listing.getPricePerNight())
                .maxGuests(listing.getMaxGuests())
                .bedrooms(listing.getBedrooms())
                .bathrooms(listing.getBathrooms())
                .address(listing.getAddress())
                .city(listing.getCity())
                .country(listing.getCountry())
                .latitude(listing.getLatitude())
                .longitude(listing.getLongitude())
                .amenities(listing.getAmenities())
                .imageUrls(listing.getImageUrls())
                .hostId(listing.getHost().getId())
                .hostName(listing.getHost().getFirstName() + " " + listing.getHost().getLastName())
                .hostAvatar(listing.getHost().getAvatarUrl())
                .averageRating(listing.getAverageRating())
                .reviewCount((int) reviewCount)
                .isActive(listing.getIsActive())
                .createdAt(listing.getCreatedAt())
                .updatedAt(listing.getUpdatedAt())
                .build();
    }
}
