

const languages = [
  {
    "title": "Multilingual",
    "value": "multi"
  },
  {
    "title": "Belarusian (Беларуская)",
    "value": "be"
  },
  {
    "title": "Bengali (বাংলা)",
    "value": "bn"
  },
  {
    "title": "Bosnian (Bosanski)",
    "value": "bs"
  },
  {
    "title": "Bulgarian (Български)",
    "value": "bg"
  },
  {
    "title": "Catalan (Català)",
    "value": "ca"
  },
  {
    "title": "Croatian (Hrvatski)",
    "value": "hr"
  },
  {
    "title": "Czech (Čeština)",
    "value": "cs"
  },
  {
    "title": "Danish (Dansk)",
    "value": "da"
  },
  {
    "title": "Danish - Denmark (Dansk - Danmark)",
    "value": "da-DK"
  },
  {
    "title": "Dutch (Nederlands)",
    "value": "nl"
  },
  {
    "title": "English",
    "value": "en"
  },
  {
    "title": "English - US",
    "value": "en-US"
  },
  {
    "title": "English - Australia",
    "value": "en-AU"
  },
  {
    "title": "English - UK",
    "value": "en-GB"
  },
  {
    "title": "English - India",
    "value": "en-IN"
  },
  {
    "title": "English - New Zealand",
    "value": "en-NZ"
  },
  {
    "title": "Estonian (Eesti)",
    "value": "et"
  },
  {
    "title": "Finnish (Suomi)",
    "value": "fi"
  },
  {
    "title": "Flemish (Vlaams)",
    "value": "nl-BE"
  },
  {
    "title": "French (Français)",
    "value": "fr"
  },
  {
    "title": "French - Canada (Français - Canada)",
    "value": "fr-CA"
  },
  {
    "title": "German (Deutsch)",
    "value": "de"
  },
  {
    "title": "German - Switzerland (Deutsch - Schweiz)",
    "value": "de-CH"
  },
  {
    "title": "Greek (Ελληνικά)",
    "value": "el"
  },
  {
    "title": "Hindi (हिन्दी)",
    "value": "hi"
  },
  {
    "title": "Hungarian (Magyar)",
    "value": "hu"
  },
  {
    "title": "Indonesian (Bahasa Indonesia)",
    "value": "id"
  },
  {
    "title": "Italian (Italiano)",
    "value": "it"
  },
  {
    "title": "Japanese (日本語)",
    "value": "ja"
  },
  {
    "title": "Kannada (ಕನ್ನಡ)",
    "value": "kn"
  },
  {
    "title": "Korean (한국어)",
    "value": "ko"
  },
  {
    "title": "Korean - Korea (한국어 - 대한민국)",
    "value": "ko-KR"
  },
  {
    "title": "Latvian (Latviešu)",
    "value": "lv"
  },
  {
    "title": "Lithuanian (Lietuvių)",
    "value": "lt"
  },
  {
    "title": "Macedonian (Македонски)",
    "value": "mk"
  },
  {
    "title": "Malay (Bahasa Melayu)",
    "value": "ms"
  },
  {
    "title": "Marathi (मराठी)",
    "value": "mr"
  },
  {
    "title": "Norwegian (Norsk)",
    "value": "no"
  },
  {
    "title": "Polish (Polski)",
    "value": "pl"
  },
  {
    "title": "Portuguese (Português)",
    "value": "pt"
  },
  {
    "title": "Portuguese - Brazil (Português - Brasil)",
    "value": "pt-BR"
  },
  {
    "title": "Portuguese - Portugal (Português - Portugal)",
    "value": "pt-PT"
  },
  {
    "title": "Romanian (Română)",
    "value": "ro"
  },
  {
    "title": "Russian (Русский)",
    "value": "ru"
  },
  {
    "title": "Serbian (Српски)",
    "value": "sr"
  },
  {
    "title": "Slovak (Slovenčina)",
    "value": "sk"
  },
  {
    "title": "Slovenian (Slovenščina)",
    "value": "sl"
  },
  {
    "title": "Spanish (Español)",
    "value": "es"
  },
  {
    "title": "Spanish - Latin America (Español - Latinoamérica)",
    "value": "es-419"
  },
  {
    "title": "Swedish (Svenska)",
    "value": "sv"
  },
  {
    "title": "Swedish - Sweden (Svenska - Sverige)",
    "value": "sv-SE"
  },
  {
    "title": "Tagalog",
    "value": "tl"
  },
  {
    "title": "Tamil (தமிழ்)",
    "value": "ta"
  },
  {
    "title": "Telugu (తెలుగు)",
    "value": "te"
  },
  {
    "title": "Turkish (Türkçe)",
    "value": "tr"
  },
  {
    "title": "Ukrainian (Українська)",
    "value": "uk"
  },
  {
    "title": "Vietnamese (Tiếng Việt)",
    "value": "vi"
  }
]


export default async function main(req: Request) {
  const options = await req.json()
  // console.log('options', JSON.stringify(options,null,2))
  return JSON.stringify(languages)
}



