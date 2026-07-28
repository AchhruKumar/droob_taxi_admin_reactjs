import { useState, useEffect } from "react";
import Select, { SingleValue } from "react-select";
import { useTranslation } from "react-i18next";

const languages = [
  { value: "en", label: "English", flagUrl: "/flags/uk.png" },
  { value: "ar", label: "Arabic", flagUrl: "/flags/uk.png" },
];

export default function LanguageSwitcherWithImages() {
  const { i18n } = useTranslation();
  const [selectedLang, setSelectedLang] = useState | (null > null);

  useEffect(() => {
    const currentLang = i18n.language || "en";
    const matchedLang = languages.find((l) => l.value === currentLang);
    setSelectedLang(matchedLang || languages[0]);
  }, [i18n.language]);

  const handleChange = (lang) => {
    if (lang) {
      setSelectedLang(lang);
      i18n.changeLanguage(lang.value);
    }
  };

  return (
    <div className="w-full space-y-4">
      <Select
        options={languages}
        value={selectedLang}
        onChange={handleChange}
        placeholder="Select language"
        classNamePrefix="lang"
        isSearchable={false}
        menuPlacement="top"
        menuPosition="absolute"
        formatOptionLabel={({ label, flagUrl }) => (
          <div className="flex items-center space-x-2">
            <img src={flagUrl} alt={label} className="w-5 h-5" />
            <span>{label}</span>
          </div>
        )}
      />
    </div>
  );
}
