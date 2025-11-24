import { B4MFunnelReact } from "@b4m-tech/widget-funnel/react";
import { useState } from "react";

function App() {
  // All props made dynamic via component state
  const [partnerId, setPartnerId] = useState("avWXB");
  const [locale, setLocale] = useState("en");
  const [email, setEmail] = useState("artist@example.com");
  const [sidebar, setSidebar] = useState<"horizontal" | "vertical">(
    "horizontal"
  );
  const [minHeight, setMinHeight] = useState("900px");

  return (
    <main className="app">
      <header>
        <h1>B4M Widget Funnel (React demo)</h1>
        <p>Rendered from the GitHub package inside this sandbox.</p>
      </header>

      <section style={{ display: "grid", gap: 8, marginBottom: 12 }}>
        <div>
          <label htmlFor="sidebar-select">Partner ID::</label>
          <select
            id="sidebar-select"
            value={sidebar}
            onChange={(e) =>
              setPartnerId(e.target.value as "shotgun" | "believe" | "avWXB")
            }
            style={{ marginLeft: 10, padding: 6 }}
          >
            <option value="avWXB">avWXB</option>
            <option value="shotgun">shotgun</option>
            <option value="believe">believe</option>
          </select>
        </div>

        <div>
          <label htmlFor="locale-select">Locale:</label>
          <select
            id="locale-select"
            value={locale}
            onChange={(e) => setLocale(e.target.value)}
            style={{ marginLeft: 10, padding: 6 }}
          >
            <option value="en">en</option>
            <option value="fr">fr</option>
            <option value="es">es</option>
            <option value="de">de</option>
          </select>
        </div>

        <div>
          <label htmlFor="email-input">Email:</label>
          <input
            id="email-input"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{ marginLeft: 10, padding: 6 }}
          />
        </div>

        <div>
          <label htmlFor="sidebar-select">Sidebar:</label>
          <select
            id="sidebar-select"
            value={sidebar}
            onChange={(e) =>
              setSidebar(e.target.value as "horizontal" | "vertical")
            }
            style={{ marginLeft: 10, padding: 6 }}
          >
            <option value="horizontal">horizontal</option>
            <option value="vertical">vertical</option>
          </select>
        </div>

        <div>
          <label htmlFor="minheight-input">Min Height (e.g. 900px):</label>
          <input
            id="minheight-input"
            type="text"
            value={minHeight}
            onChange={(e) => setMinHeight(e.target.value)}
            style={{ marginLeft: 10, padding: 6 }}
          />
        </div>
      </section>

      <section style={{ marginBottom: 14 }}>
        <strong>Current props:</strong>
        <pre
          style={{
            background: "#f6f8fa",
            padding: 10,
            borderRadius: 6,
            overflowX: "auto",
            marginTop: 8,
          }}
        >
          {JSON.stringify(
            { partnerId, locale, email, sidebar, minHeight },
            null,
            2
          )}
        </pre>
      </section>

      <section className="widget" style={{ borderTop: "1px solid #eee" }}>
        <B4MFunnelReact
          partnerId={partnerId}
          locale={locale}
          email={email}
          sidebar={sidebar}
          minHeight={minHeight}
        />
      </section>
    </main>
  );
}

export default App;
