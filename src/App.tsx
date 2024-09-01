import Container from "./components/Container";
import { NavBar } from "./components/NavBar";
import { AuthProvider } from "./context/AuthContext";
import Router from "./routes/Router";

const App = () => {
    return (
        <AuthProvider>
            <>
                <NavBar />
                <Container className="">
                    <Router />
                </Container>
            </>
        </AuthProvider>
    );
};

export default App;
