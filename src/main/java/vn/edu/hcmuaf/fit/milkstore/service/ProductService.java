package vn.edu.hcmuaf.fit.milkstore.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import vn.edu.hcmuaf.fit.milkstore.entity.Product;
import vn.edu.hcmuaf.fit.milkstore.repository.ProductRepository;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository productRepository;

    public List<Product> getHotDeals() {
        return productRepository.findTopHotDeals();
    }

    public List<Product> getNewProducts() {
        return productRepository.findTopNewProducts();
    }

    public List<Product> getAllProducts() {
        return productRepository.findAll();
    }

}