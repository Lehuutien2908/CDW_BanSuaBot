package vn.edu.hcmuaf.fit.milkstore.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import vn.edu.hcmuaf.fit.milkstore.entity.Brand;
import vn.edu.hcmuaf.fit.milkstore.service.BrandService;

import java.util.List;

@RestController
@RequestMapping("api/brands")
@RequiredArgsConstructor
public class BrandController {
    private final BrandService brandService;

    @GetMapping
    public List<Brand> getAllBrands(){
        return brandService.getAllBrands();
    }

    @PostMapping
    public Brand createBrand(@RequestBody Brand brand){
        return brandService.createBrand(brand);
    }
}
