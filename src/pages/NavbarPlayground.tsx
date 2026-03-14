import { type CSSProperties } from "react";
import { Navbar } from "../components/Navbar";
import { NavigationBrandItem } from "../components/NavigationBrandItem";

const sectionStyle: CSSProperties = { marginBottom: 48 };
const cardStyle: CSSProperties = {
  border: "1px solid #ddd",
  borderRadius: 8,
  padding: 0,
  marginTop: 12,
  height: 200,
  overflow: "hidden",
};

function WithLogoDemo() {
  return (
    <div style={cardStyle}>
      <Navbar logo={<NavigationBrandItem hideLogotype />}>
        <span style={{ opacity: 0.5, fontSize: 13 }}>Content area</span>
      </Navbar>
    </div>
  );
}

function WithoutLogoDemo() {
  return (
    <div style={cardStyle}>
      <Navbar>
        <span style={{ opacity: 0.5, fontSize: 13 }}>Content area</span>
      </Navbar>
    </div>
  );
}

function WithLogoBadgeDemo() {
  return (
    <div style={cardStyle}>
      <Navbar logo={<NavigationBrandItem hideLogotype badge />}>
        <span style={{ opacity: 0.5, fontSize: 13 }}>Content area</span>
      </Navbar>
    </div>
  );
}

export default function NavbarPlayground() {
  return (
    <>
      <h1>Navbar</h1>

      <section style={sectionStyle}>
        <h2>With Logo</h2>
        <p style={{ fontSize: 13, margin: "0 0 8px", opacity: 0.7 }}>
          Horizontal navbar with NavigationBrandItem logo.
        </p>
        <WithLogoDemo />
      </section>

      <section style={sectionStyle}>
        <h2>With Logo + Notification Badge</h2>
        <p style={{ fontSize: 13, margin: "0 0 8px", opacity: 0.7 }}>
          Logo with a notification badge indicator.
        </p>
        <WithLogoBadgeDemo />
      </section>

      <section style={sectionStyle}>
        <h2>Without Logo</h2>
        <p style={{ fontSize: 13, margin: "0 0 8px", opacity: 0.7 }}>
          Navbar with no logo — content fills the full width.
        </p>
        <WithoutLogoDemo />
      </section>
    </>
  );
}
