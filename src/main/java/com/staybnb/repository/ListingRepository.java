package com.staybnb.repository;

import com.staybnb.model.Listing;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;

@Repository
public interface ListingRepository extends JpaRepository<Listing, Long> {

    Page<Listing> findByIsActiveTrue(Pageable pageable);

    Page<Listing> findByHostIdAndIsActiveTrue(Long hostId, Pageable pageable);

    @Query("""
        SELECT l FROM Listing l
        WHERE l.isActive = true
          AND (:city IS NULL OR LOWER(l.city) LIKE LOWER(CONCAT('%', :city, '%')))
          AND (:country IS NULL OR LOWER(l.country) LIKE LOWER(CONCAT('%', :country, '%')))
          AND (:minPrice IS NULL OR l.pricePerNight >= :minPrice)
          AND (:maxPrice IS NULL OR l.pricePerNight <= :maxPrice)
          AND (:maxGuests IS NULL OR l.maxGuests >= :maxGuests)
          AND (:propertyType IS NULL OR CAST(l.propertyType AS string) = :propertyType)
    """)
    Page<Listing> searchListings(
        @Param("city") String city,
        @Param("country") String country,
        @Param("minPrice") BigDecimal minPrice,
        @Param("maxPrice") BigDecimal maxPrice,
        @Param("maxGuests") Integer maxGuests,
        @Param("propertyType") String propertyType,
        Pageable pageable
    );

    List<Listing> findByHostIdAndIsActiveTrue(Long hostId);
}
