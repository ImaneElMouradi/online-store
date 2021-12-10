package com.mycompany.store.repository;

import com.mycompany.store.domain.CustomerDetails;
import org.springframework.data.jpa.repository.*;
import org.springframework.stereotype.Repository;

/**
 * Spring Data SQL repository for the CustomerDetails entity.
 */
@SuppressWarnings("unused")
@Repository
public interface CustomerDetailsRepository extends JpaRepository<CustomerDetails, Long> {}
