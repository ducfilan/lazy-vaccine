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
      name: "Vietnamese"
    },
    {
      code: "ja",
      name: "Japanese"
    }
  ],
  Set: {
    ar: {
      code: "ar",
      name: "Arabic"
    },
    zh: {
      code: "zh",
      name: "Chinese"
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
      name: "German"
    },
    it: {
      code: "it",
      name: "Italian"
    },
    ja: {
      code: "ja",
      name: "Japanese"
    },
    ko: {
      code: "ko",
      name: "Korean"
    },
    mn: {
      code: "mn",
      name: "Mongolian"
    },
    pt: {
      code: "pt",
      name: "Portuguese"
    },
    ru: {
      code: "ru",
      name: "Russian"
    },
    sl: {
      code: "sl",
      name: "Slovenian"
    },
    es: {
      code: "es",
      name: "Spanish"
    },
    vi: {
      code: "vi",
      name: "Vietnamese"
    },
  },
}

export default SupportingLanguages
