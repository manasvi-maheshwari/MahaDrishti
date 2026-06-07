"use client";
import { useEffect, useState } from "react";

declare global {
  interface Window {
    googleTranslateElementInit: () => void;
    google: any;
  }
}

export default function GoogleTranslate() {
  const [current, setCurrent] = useState("en");

  useEffect(() => {
    window.googleTranslateElementInit = function () {
      new window.google.translate.TranslateElement({
        pageLanguage: "en",
        includedLanguages: "hi,gu,mr,bn,bho,ta,te,or,pa,mai,ne",
        autoDisplay: false,
      }, "google_translate_element");
    };

    const script = document.createElement("script");
    script.src = "https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
    script.async = true;
    document.body.appendChild(script);
  }, []);

  const handleChange = (lang: string) => {
    setCurrent(lang);

    if (lang === "en") {
      // Clear all google translate cookies
      const cookies = ["googtrans"];
      cookies.forEach(name => {
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${window.location.hostname}`;
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=.${window.location.hostname}`;
      });
      window.location.reload();
      return;
    }

    const select = document.querySelector("select.goog-te-combo") as HTMLSelectElement;
    if (select) {
      select.value = lang;
      select.dispatchEvent(new Event("change"));
    }
  };

  return (
    <>
      <div id="google_translate_element" style={{ display: "none" }} />
      <style>{`
  .goog-te-banner-frame { display: none !important; }
  body { top: 0 !important; }
  .skiptranslate { display: none !important; }
  iframe.skiptranslate { display: none !important; }
  .goog-te-spinner-pos { display: none !important; }
  font:not(.shimmer-text) { background-color: transparent !important; box-shadow: none !important; }
.goog-text-highlight font { background: none !important; }
  .goog-text-highlight { background: none !important; box-shadow: none !important; border: none !important; }
`}</style>
      <div style={{ position: "fixed", bottom: "1.5rem", right: "1.5rem", zIndex: 9999 }}>
        <select
          value={current}
          onChange={e => handleChange(e.target.value)}
          style={{
            background: "rgba(13,10,46,0.95)",
            border: "1px solid rgba(255,107,26,0.4)",
            color: "#FFF8EE",
            borderRadius: "20px",
            padding: "6px 6px",
            fontSize: "13px",
            fontFamily: "'DM Sans', sans-serif",
            cursor: "pointer",
            outline: "none",
            boxShadow: "0 4px 20px rgba(0,0,0,0.4)",
          }}
        >
          <option value="en">English</option>
          <option value="hi">हिंदी</option>
          <option value="gu">ગુજરાતી</option>
          <option value="mr">मराठी</option>
          <option value="bn">বাংলা</option>
          <option value="bho">भोजपुरी</option>
          <option value="ta">தமிழ்</option>
          <option value="te">తెలుగు</option>
          <option value="or">ଓଡ଼ିଆ</option>
          <option value="pa">ਪੰਜਾਬੀ</option>
          <option value="mai">मैथिली</option>
          <option value="ne">नेपाली</option>
        </select>
      </div>
    </>
  );
}