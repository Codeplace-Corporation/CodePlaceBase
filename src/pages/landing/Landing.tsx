import { Hero } from "./components/Hero";
import { Screenshot } from "./components/Screenshot";
import { Waitlist } from "./components/Waitlist";
import { Features } from "./components/Features";
import { Footer } from "./components/Footer";

const Landing = () => {
    return (
        <div className="justify-center items-center">
            <Hero />
            <Screenshot />
            <Features />
            <Waitlist />
            <Footer />
        </div>
    );
};

export default Landing;
