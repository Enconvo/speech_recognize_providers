const languages = [
    {
        "title": "Auto (Auto)",
        "value": "auto"
    },
    {
        "title": "English (English)",
        "value": "en"
    },
    {
        "title": "Chinese (中文)",
        "value": "zh"
    },
    {
        "title": "German (Deutsch)",
        "value": "de"
    },
    {
        "title": "Spanish (Español)",
        "value": "es"
    },
    {
        "title": "Russian (Русский)",
        "value": "ru"
    },
    {
        "title": "Korean (한국어)",
        "value": "ko"
    },
    {
        "title": "French (Français)",
        "value": "fr"
    },
    {
        "title": "Japanese (日本語)",
        "value": "ja"
    },
    {
        "title": "Portuguese (Português)",
        "value": "pt"
    },
    {
        "title": "Turkish (Türkçe)",
        "value": "tr"
    },
    {
        "title": "Polish (Polski)",
        "value": "pl"
    },
    {
        "title": "Catalan (Català)",
        "value": "ca"
    },
    {
        "title": "Dutch (Nederlands)",
        "value": "nl"
    },
    {
        "title": "Arabic (العربية)",
        "value": "ar"
    },
    {
        "title": "Swedish (Svenska)",
        "value": "sv"
    },
    {
        "title": "Italian (Italiano)",
        "value": "it"
    },
    {
        "title": "Indonesian (Bahasa Indonesia)",
        "value": "id"
    },
    {
        "title": "Hindi (हिन्दी)",
        "value": "hi"
    },
    {
        "title": "Finnish (Suomi)",
        "value": "fi"
    },
    {
        "title": "Vietnamese (Tiếng Việt)",
        "value": "vi"
    },
    {
        "title": "Hebrew (עברית)",
        "value": "he"
    },
    {
        "title": "Ukrainian (Українська)",
        "value": "uk"
    },
    {
        "title": "Greek (Ελληνικά)",
        "value": "el"
    },
    {
        "title": "Malay (Bahasa Melayu)",
        "value": "ms"
    },
    {
        "title": "Czech (Čeština)",
        "value": "cs"
    },
    {
        "title": "Romanian (Română)",
        "value": "ro"
    },
    {
        "title": "Danish (Dansk)",
        "value": "da"
    },
    {
        "title": "Hungarian (Magyar)",
        "value": "hu"
    },
    {
        "title": "Tamil (தமிழ்)",
        "value": "ta"
    },
    {
        "title": "Norwegian (Norsk)",
        "value": "no"
    },
    {
        "title": "Thai (ไทย)",
        "value": "th"
    },
    {
        "title": "Urdu (اردو)",
        "value": "ur"
    },
    {
        "title": "Croatian (Hrvatski)",
        "value": "hr"
    },
    {
        "title": "Bulgarian (Български)",
        "value": "bg"
    },
    {
        "title": "Lithuanian (Lietuvių)",
        "value": "lt"
    },
    {
        "title": "Latin (Latina)",
        "value": "la"
    },
    {
        "title": "Maori (Māori)",
        "value": "mi"
    },
    {
        "title": "Malayalam (മലയാളം)",
        "value": "ml"
    },
    {
        "title": "Welsh (Cymraeg)",
        "value": "cy"
    },
    {
        "title": "Slovak (Slovenčina)",
        "value": "sk"
    },
    {
        "title": "Telugu (తెలుగు)",
        "value": "te"
    },
    {
        "title": "Persian (فارسی)",
        "value": "fa"
    },
    {
        "title": "Latvian (Latviešu)",
        "value": "lv"
    },
    {
        "title": "Bengali (বাংলা)",
        "value": "bn"
    },
    {
        "title": "Serbian (Српски)",
        "value": "sr"
    },
    {
        "title": "Azerbaijani (Azərbaycan)",
        "value": "az"
    },
    {
        "title": "Slovenian (Slovenščina)",
        "value": "sl"
    },
    {
        "title": "Kannada (ಕನ್ನಡ)",
        "value": "kn"
    },
    {
        "title": "Estonian (Eesti)",
        "value": "et"
    },
    {
        "title": "Macedonian (Македонски)",
        "value": "mk"
    },
    {
        "title": "Breton (Brezhoneg)",
        "value": "br"
    },
    {
        "title": "Basque (Euskara)",
        "value": "eu"
    },
    {
        "title": "Icelandic (Íslenska)",
        "value": "is"
    },
    {
        "title": "Armenian (Հայերեն)",
        "value": "hy"
    },
    {
        "title": "Nepali (नेपाली)",
        "value": "ne"
    },
    {
        "title": "Mongolian (Монгол)",
        "value": "mn"
    },
    {
        "title": "Bosnian (Bosanski)",
        "value": "bs"
    },
    {
        "title": "Kazakh (Қазақ)",
        "value": "kk"
    },
    {
        "title": "Albanian (Shqip)",
        "value": "sq"
    },
    {
        "title": "Swahili (Kiswahili)",
        "value": "sw"
    },
    {
        "title": "Galician (Galego)",
        "value": "gl"
    },
    {
        "title": "Marathi (मराठी)",
        "value": "mr"
    },
    {
        "title": "Punjabi (ਪੰਜਾਬੀ)",
        "value": "pa"
    },
    {
        "title": "Sinhala (සිංහල)",
        "value": "si"
    },
    {
        "title": "Khmer (ខ្មែរ)",
        "value": "km"
    },
    {
        "title": "Shona (chiShona)",
        "value": "sn"
    },
    {
        "title": "Yoruba (Yorùbá)",
        "value": "yo"
    },
    {
        "title": "Somali (Soomaali)",
        "value": "so"
    },
    {
        "title": "Afrikaans (Afrikaans)",
        "value": "af"
    },
    {
        "title": "Occitan (Occitan)",
        "value": "oc"
    },
    {
        "title": "Georgian (ქართული)",
        "value": "ka"
    },
    {
        "title": "Belarusian (Беларуская)",
        "value": "be"
    },
    {
        "title": "Tajik (Тоҷикӣ)",
        "value": "tg"
    },
    {
        "title": "Sindhi (سنڌي)",
        "value": "sd"
    },
    {
        "title": "Gujarati (ગુજરાતી)",
        "value": "gu"
    },
    {
        "title": "Amharic (አማርኛ)",
        "value": "am"
    },
    {
        "title": "Yiddish (ייִדיש)",
        "value": "yi"
    },
    {
        "title": "Lao (ລາວ)",
        "value": "lo"
    },
    {
        "title": "Uzbek (Oʻzbek)",
        "value": "uz"
    },
    {
        "title": "Faroese (Føroyskt)",
        "value": "fo"
    },
    {
        "title": "Haitian Creole (Kreyòl Ayisyen)",
        "value": "ht"
    },
    {
        "title": "Pashto (پښتو)",
        "value": "ps"
    },
    {
        "title": "Turkmen (Türkmençe)",
        "value": "tk"
    },
    {
        "title": "Nynorsk (Nynorsk)",
        "value": "nn"
    },
    {
        "title": "Maltese (Malti)",
        "value": "mt"
    },
    {
        "title": "Sanskrit (संस्कृतम्)",
        "value": "sa"
    },
    {
        "title": "Luxembourgish (Lëtzebuergesch)",
        "value": "lb"
    },
    {
        "title": "Myanmar (မြန်မာ)",
        "value": "my"
    },
    {
        "title": "Tibetan (བོད་ཡིག)",
        "value": "bo"
    },
    {
        "title": "Tagalog (Tagalog)",
        "value": "tl"
    },
    {
        "title": "Malagasy (Malagasy)",
        "value": "mg"
    },
    {
        "title": "Assamese (অসমীয়া)",
        "value": "as"
    },
    {
        "title": "Tatar (Татар)",
        "value": "tt"
    },
    {
        "title": "Hawaiian (ʻŌlelo Hawaiʻi)",
        "value": "haw"
    },
    {
        "title": "Lingala (Lingála)",
        "value": "ln"
    },
    {
        "title": "Hausa (Hausa)",
        "value": "ha"
    },
    {
        "title": "Bashkir (Башҡорт)",
        "value": "ba"
    },
    {
        "title": "Javanese (Basa Jawa)",
        "value": "jw"
    },
    {
        "title": "Sundanese (Basa Sunda)",
        "value": "su"
    },
    {
        "title": "Cantonese (粵語)",
        "value": "yue"
    }
]

async function fetch_model() {

    return languages
}

export default async function main() {
    let languages = await fetch_model()

    return JSON.stringify(languages)
}



