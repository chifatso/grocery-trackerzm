import Navbar from "./Navbar";

function MainLayout({ children }) {
    return (
        <>
            <Navbar />
            <main className="main-content">
                {children}
            </main>
        </>
    );
}

export default MainLayout;