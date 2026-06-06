import React from "react";

import Banner from "../components/banner/Banner";
import HotDeals from "../components/product/HotDeals";
import NewProduct from "../components/product/NewProduct";

const Home = () => {
    return (
        <main>
            <Banner />
            <HotDeals />
            <NewProduct />
        </main>
    );
};

export default Home;
