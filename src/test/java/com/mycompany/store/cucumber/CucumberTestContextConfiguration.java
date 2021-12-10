package com.mycompany.store.cucumber;

import com.mycompany.store.StoreApp;
import io.cucumber.spring.CucumberContextConfiguration;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.web.WebAppConfiguration;

@CucumberContextConfiguration
@SpringBootTest(classes = StoreApp.class)
@WebAppConfiguration
public class CucumberTestContextConfiguration {}
