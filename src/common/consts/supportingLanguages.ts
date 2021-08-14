type _ = {
  UI: {
    code: string;
    name: string;
  }[]
  Set: {
    [key: string]: {
      code: string;
      name: string;
    }
  }
}

const SupportingLanguages: _ = {
  UI: [
    {
      code: "en",
      name: "English"
    },
    {
      code: "vi",
      name: "Vietnamese (Tiếng Việt)"
    },
    {
      code: "ja",
      name: "Japanese (日本語)"
    }
  ],
  Set: {
    ar: {
      code: "ar",
      name: "Arabic (عربى)"
    },
    zh: {
      code: "zh",
      name: "Chinese (中文)"
    },
    nl: {
      code: "nl",
      name: "Dutch"
    },
    en: {
      code: "en",
      name: "English"
    },
    de: {
      code: "de",
      name: "German (Deutsche)"
    },
    it: {
      code: "it",
      name: "Italian (l'italiano)"
    },
    ja: {
      code: "ja",
      name: "Japanese (日本語)"
    },
    ko: {
      code: "ko",
      name: "Korean (한국어)"
    },
    mn: {
      code: "mn",
      name: "Mongolian (Монгол)"
    },
    pt: {
      code: "pt",
      name: "Portuguese (Português)"
    },
    ru: {
      code: "ru",
      name: "Russian (русский)"
    },
    sl: {
      code: "sl",
      name: "Slovenian (Slovenščina)"
    },
    es: {
      code: "es",
      name: "Spanish (Español)"
    },
    vi: {
      code: "vi",
      name: "Vietnamese (Tiếng Việt)"
    },
  },
}

export default SupportingLanguages
