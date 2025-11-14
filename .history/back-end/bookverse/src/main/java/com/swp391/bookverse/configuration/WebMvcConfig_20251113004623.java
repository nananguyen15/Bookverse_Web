package com.swp391.bookverse.configuration;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * Web MVC configuration for serving static resources
 */
@Configuration
public class WebMvcConfig implements WebMvcConfigurer {

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // Serve static images from front-end/public/img/
        String projectRoot = System.getProperty("user.dir").replace("\\back-end\\bookverse", "");
        String imgLocation = "file:///" + projectRoot + "/front-end/public/img/";
        
        registry.addResourceHandler("/img/**")
                .addResourceLocations(imgLocation);
        
        System.out.println("📁 Static resources configured: /img/** → " + imgLocation);
    }
}
