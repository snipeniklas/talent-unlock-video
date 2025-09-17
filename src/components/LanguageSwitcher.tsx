import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Globe } from "lucide-react";
import { useTranslation } from "@/i18n/i18n";

export default function LanguageSwitcher() {
  const { lang, setLang } = useTranslation();

  const languages = [
    { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
    { code: 'en', name: 'English', flag: '🇺🇸' }
  ];

  return (
    <Select value={lang} onValueChange={setLang}>
      <SelectTrigger className="w-auto min-w-[120px] h-9">
        <SelectValue>
          <div className="flex items-center gap-2">
            <Globe className="h-4 w-4" />
            <span className="hidden sm:inline">
              {languages.find(l => l.code === lang)?.name}
            </span>
            <span className="sm:hidden">
              {languages.find(l => l.code === lang)?.flag}
            </span>
          </div>
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {languages.map((lang) => (
          <SelectItem key={lang.code} value={lang.code}>
            <div className="flex items-center gap-2">
              <span>{lang.flag}</span>
              <span>{lang.name}</span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}