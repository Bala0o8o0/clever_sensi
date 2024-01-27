import { Analytics } from "@vercel/analytics/react";
import "../styles/globals.css";

export const metdata = {
  title: "Clever Sensei",
  openGraph: {
    title: "Clever Sensei",
    description: "Text Generation's AI Sensei ",
  },
};

export default function RootLayout({ children }) {
  return (
    <html>
      <head>
        <title>Clever Sensei</title>
        
        <link
          rel="icon"
          
          href="https://png.pngtree.com/png-clipart/20211009/original/pngtree-alien-logo-hip-style-spitting-smoke-eyes-orange-png-image_6841209.png"
        />
      </head>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
