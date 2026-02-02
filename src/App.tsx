import "./index.css";
import { Layout } from "@/components/Layout";
import { Game } from "@/components/Game";
import { backgroundAssets } from "@/assets";
import { useEffect } from "react";

export function App() {
  useEffect(() => {
    // Set the background image CSS variable
    document.documentElement.style.setProperty('--background-image', `url(${backgroundAssets.welcome})`);
  }, []);

  return (
    <Layout>
      <Game />
    </Layout>
  );
}

export default App;
