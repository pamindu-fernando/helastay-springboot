package com.staybnb.repository;

import com.staybnb.model.Review;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ReviewRepository extends JpaRepository<Review, Long> {

    List<Review> findByListingIdOrderByCreatedAtDesc(Long listingId);

    Optional<Review> findByListingIdAndGuestId(Long listingId, Long guestId);

    @Query("SELECT AVG(r.rating) FROM Review r WHERE r.listing.id = :listingId")
    Optional<Double> calculateAverageRating(@Param("listingId") Long listingId);

    long countByListingId(Long listingId);
}
