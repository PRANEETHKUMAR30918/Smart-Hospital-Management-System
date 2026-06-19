package com.hospital.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/test")
@RequiredArgsConstructor
public class TestController {
    private final JdbcTemplate jdbcTemplate;

    @GetMapping("/schema")
    public Object getSchema() {
        try {
            return jdbcTemplate.queryForList("SHOW CREATE TABLE prescriptions");
        } catch (Exception e) {
            return e.getMessage();
        }
    }
    
    @GetMapping("/data")
    public Object getData() {
        try {
            return jdbcTemplate.queryForList("SELECT id, appointment_id, patient_id FROM prescriptions");
        } catch (Exception e) {
            return e.getMessage();
        }
    }
}
