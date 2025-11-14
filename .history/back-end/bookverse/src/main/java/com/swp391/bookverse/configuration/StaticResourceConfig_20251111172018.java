package com.swp391.bookverse.configuration;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.nio.file.Path;
import java.nio.file.Paths;

/**
 * Configuration to serve static image files from front-end/src/assets/img/
 * This allows images uploaded via backend to be accessible at /img/** URL pattern
 */
@Configuration
public class StaticResourceConfig implements WebMvcConfigurer {

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // Get absolute path to front-end/src/assets/img folder
        // Backend is at: project-root/back-end/bookverse/
        // Frontend is at: project-root/front-end/
        Path currentPath = Paths.get("").toAbsolutePath();
        Path projectRoot = currentPath.getParent().getParent(); // Go up 2 levels from back-end/bookverse
        Path imageFolder = projectRoot.resolve("front-end/src/assets/img");
        
        String imageFolderUri = "file:" + imageFolder.toString().replace("\\", "/") + "/";
        
        // Map /img/** URLs to front-end/src/assets/img/ folder
        // Example: /img/avatar/123-photo.jpg → front-end/src/assets/img/avatar/123-photo.jpg
        registry.addResourceHandler("/img/**")
                .addResourceLocations(imageFolderUri)
                .setCachePeriod(3600); // Cache for 1 hour
        
        System.out.println("✅ Static image resources configured:");
        System.out.println("   URL pattern: /img/**");
        System.out.println("   File location: " + imageFolder.toAbsolutePath());
    }
}
