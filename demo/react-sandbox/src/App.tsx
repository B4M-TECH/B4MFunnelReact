import { B4MFunnelReact } from "@b4m-tech/widget-funnel/react";

function App() {
  return (
    <main className="app">
      <header>
        <h1>B4M Widget Funnel (React demo)</h1>
        <p>Rendered from the GitHub package inside this sandbox.</p>
      </header>

      <section className="widget">
        <B4MFunnelReact
          partnerId="avWXB"
          locale="en"
          email="artist@example.com"
          artistSpotifyId="1vCWHaC5f2uS3yhpwWbIA6"
          sidebar="horizontal"
          minHeight="900px"
        />
      </section>
    </main>
  );
}

export default App;
