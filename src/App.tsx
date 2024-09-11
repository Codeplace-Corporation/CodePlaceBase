import Container from "./components/Container";
import { NavBar } from "./components/NavBar";
import { AuthProvider } from "./context/AuthContext";
import Router from "./routes/Router";

const App = () => {
    return (
        <AuthProvider>
            <div className="h-screen overflow-auto">
                <NavBar />
                <Container className="pt-20">
                    <Router />
                </Container>
            </div>
        </AuthProvider>
    );
};

export default App;
