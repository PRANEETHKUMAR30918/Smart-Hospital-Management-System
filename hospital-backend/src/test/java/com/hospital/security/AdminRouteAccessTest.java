package com.hospital.security;

import com.hospital.config.SecurityConfig;
import com.hospital.controller.AdminController;
import com.hospital.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Checks the URL-level rule in SecurityConfig: /api/admin/** is ADMIN-only.
 * Runs only the web layer with the real SecurityConfig; the database is not used.
 */
@WebMvcTest(controllers = AdminController.class)
@Import(SecurityConfig.class)
class AdminRouteAccessTest {

    @Autowired private MockMvc mockMvc;

    @MockBean private UserRepository userRepository;
    @MockBean private JwtUtils jwtUtils;
    @MockBean private UserDetailsServiceImpl userDetailsService;

    @Test
    @WithMockUser(roles = "ADMIN")
    void admin_canListUsers() throws Exception {
        mockMvc.perform(get("/api/admin/users")).andExpect(status().isOk());
    }

    @Test
    @WithMockUser(roles = "DOCTOR")
    void doctor_isForbiddenFromAdminRoutes() throws Exception {
        mockMvc.perform(get("/api/admin/users")).andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(roles = "PATIENT")
    void patient_isForbiddenFromListingUsers() throws Exception {
        mockMvc.perform(get("/api/admin/users")).andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(roles = "PATIENT")
    void patient_isForbiddenFromDeletingUsers() throws Exception {
        mockMvc.perform(delete("/api/admin/users/1")).andExpect(status().isForbidden());
    }

    @Test
    void anonymousRequest_isRejected() throws Exception {
        mockMvc.perform(get("/api/admin/users")).andExpect(status().is4xxClientError());
    }
}
