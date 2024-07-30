import { environment } from "@enconvo/api";
import fs from 'fs'


const voices = [
    {
        "title": "English (Australia)",
        "value": "en-AU"
    },
    {
        "title": "English (Canada)",
        "value": "en-CA"
    },
    {
        "title": "English (United Kingdom)",
        "value": "en-GB"
    },
    {
        "title": "English (Ghana)",
        "value": "en-GH"
    },
    {
        "title": "English (Hong Kong SAR)",
        "value": "en-HK"
    },
    {
        "title": "English (Ireland)",
        "value": "en-IE"
    },
    {
        "title": "English (India)",
        "value": "en-IN"
    },
    {
        "title": "English (Kenya)",
        "value": "en-KE"
    },
    {
        "title": "English (Nigeria)",
        "value": "en-NG"
    },
    {
        "title": "English (New Zealand)",
        "value": "en-NZ"
    },
    {
        "title": "English (Philippines)",
        "value": "en-PH"
    },
    {
        "title": "English (Singapore)",
        "value": "en-SG"
    },
    {
        "title": "English (Tanzania)",
        "value": "en-TZ"
    },
    {
        "title": "English (United States)",
        "value": "en-US"
    },
    {
        "title": "English (South Africa)",
        "value": "en-ZA"
    },
    {
        "title": "中文（普通话，简体）",
        "value": "zh-CN"
    },
    {
        "title": "中文（胶辽官话，简体）",
        "value": "zh-CN-shandong"
    },
    {
        "title": "中文（西南官话，简体）",
        "value": "zh-CN-sichuan"
    },
    {
        "title": "中文（粤语，繁體）",
        "value": "zh-HK"
    },
    {
        "title": "中文（台灣國語，繁體）",
        "value": "zh-TW"
    },
    {
        "title": "Español (Argentina)",
        "value": "es-AR"
    },
    {
        "title": "Español (Bolivia)",
        "value": "es-BO"
    },
    {
        "title": "Español (Chile)",
        "value": "es-CL"
    },
    {
        "title": "Español (Colombia)",
        "value": "es-CO"
    },
    {
        "title": "Español (Costa Rica)",
        "value": "es-CR"
    },
    {
        "title": "Español (Cuba)",
        "value": "es-CU"
    },
    {
        "title": "Español (República Dominicana)",
        "value": "es-DO"
    },
    {
        "title": "Español (Ecuador)",
        "value": "es-EC"
    },
    {
        "title": "Español (España)",
        "value": "es-ES"
    },
    {
        "title": "Español (Guinea Ecuatorial)",
        "value": "es-GQ"
    },
    {
        "title": "Español (Guatemala)",
        "value": "es-GT"
    },
    {
        "title": "Español (Honduras)",
        "value": "es-HN"
    },
    {
        "title": "Español (México)",
        "value": "es-MX"
    },
    {
        "title": "Español (Nicaragua)",
        "value": "es-NI"
    },
    {
        "title": "Español (Panamá)",
        "value": "es-PA"
    },
    {
        "title": "Español (Perú)",
        "value": "es-PE"
    },
    {
        "title": "Español (Puerto Rico)",
        "value": "es-PR"
    },
    {
        "title": "Español (Paraguay)",
        "value": "es-PY"
    },
    {
        "title": "Español (El Salvador)",
        "value": "es-SV"
    },
    {
        "title": "Español (Estados Unidos)",
        "value": "es-US"
    },
    {
        "title": "Español (Uruguay)",
        "value": "es-UY"
    },
    {
        "title": "Español (Venezuela)",
        "value": "es-VE"
    },
    {
        "title": "Français (Belgique)",
        "value": "fr-BE"
    },
    {
        "title": "Français (Canada)",
        "value": "fr-CA"
    },
    {
        "title": "Français (Suisse)",
        "value": "fr-CH"
    },
    {
        "title": "Français (France)",
        "value": "fr-FR"
    },
    {
        "title": "Deutsch (Österreich)",
        "value": "de-AT"
    },
    {
        "title": "Deutsch (Schweiz)",
        "value": "de-CH"
    },
    {
        "title": "Deutsch (Deutschland)",
        "value": "de-DE"
    },
    {
        "title": "日本語（日本）",
        "value": "ja-JP"
    },
    {
        "title": "한국어 (대한민국)",
        "value": "ko-KR"
    },
    {
        "title": "Русский (Россия)",
        "value": "ru-RU"
    },
    {
        "title": "العربية (الإمارات العربية المتحدة)",
        "value": "ar-AE"
    },
    {
        "title": "العربية (البحرين)",
        "value": "ar-BH"
    },
    {
        "title": "العربية (الجزائر)",
        "value": "ar-DZ"
    },
    {
        "title": "العربية (مصر)",
        "value": "ar-EG"
    },
    {
        "title": "العربية (إسرائيل)",
        "value": "ar-IL"
    },
    {
        "title": "العربية (العراق)",
        "value": "ar-IQ"
    },
    {
        "title": "العربية (الأردن)",
        "value": "ar-JO"
    },
    {
        "title": "العربية (الكويت)",
        "value": "ar-KW"
    },
    {
        "title": "العربية (لبنان)",
        "value": "ar-LB"
    },
    {
        "title": "العربية (ليبيا)",
        "value": "ar-LY"
    },
    {
        "title": "العربية (المغرب)",
        "value": "ar-MA"
    },
    {
        "title": "العربية (عُمان)",
        "value": "ar-OM"
    },
    {
        "title": "العربية (السلطة الفلسطينية)",
        "value": "ar-PS"
    },
    {
        "title": "العربية (قطر)",
        "value": "ar-QA"
    },
    {
        "title": "العربية (المملكة العربية السعودية)",
        "value": "ar-SA"
    },
    {
        "title": "العربية (سوريا)",
        "value": "ar-SY"
    },
    {
        "title": "العربية (تونس)",
        "value": "ar-TN"
    },
    {
        "title": "العربية (اليمن)",
        "value": "ar-YE"
    },
    {
        "title": "Português (Brasil)",
        "value": "pt-BR"
    },
    {
        "title": "Português (Portugal)",
        "value": "pt-PT"
    },
    {
        "title": "Italiano (Svizzera)",
        "value": "it-CH"
    },
    {
        "title": "Italiano (Italia)",
        "value": "it-IT"
    },
    {
        "title": "हिन्दी (भारत)",
        "value": "hi-IN"
    },
    {
        "title": "Afrikaans (Suid-Afrika)",
        "value": "af-ZA"
    },
    {
        "title": "አማርኛ (ኢትዮጵያ)",
        "value": "am-ET"
    },
    {
        "title": "Azərbaycan dili (Latın, Azərbaycan)",
        "value": "az-AZ"
    },
    {
        "title": "Български (България)",
        "value": "bg-BG"
    },
    {
        "title": "বাংলা (ভারত)",
        "value": "bn-IN"
    },
    {
        "title": "Bosanski (Bosna i Hercegovina)",
        "value": "bs-BA"
    },
    {
        "title": "Català",
        "value": "ca-ES"
    },
    {
        "title": "Čeština (Česko)",
        "value": "cs-CZ"
    },
    {
        "title": "Cymraeg (Y Deyrnas Unedig)",
        "value": "cy-GB"
    },
    {
        "title": "Dansk (Danmark)",
        "value": "da-DK"
    },
    {
        "title": "Ελληνικά (Ελλάδα)",
        "value": "el-GR"
    },
    {
        "title": "Eesti (Eesti)",
        "value": "et-EE"
    },
    {
        "title": "Euskara",
        "value": "eu-ES"
    },
    {
        "title": "فارسی (ایران)",
        "value": "fa-IR"
    },
    {
        "title": "Suomi (Suomi)",
        "value": "fi-FI"
    },
    {
        "title": "Filipino (Pilipinas)",
        "value": "fil-PH"
    },
    {
        "title": "Gaeilge (Éire)",
        "value": "ga-IE"
    },
    {
        "title": "Galego",
        "value": "gl-ES"
    },
    {
        "title": "ગુજરાતી (ભારત)",
        "value": "gu-IN"
    },
    {
        "title": "עברית (ישראל)",
        "value": "he-IL"
    },
    {
        "title": "Hrvatski (Hrvatska)",
        "value": "hr-HR"
    },
    {
        "title": "Magyar (Magyarország)",
        "value": "hu-HU"
    },
    {
        "title": "Հայերեն (Հայաստան)",
        "value": "hy-AM"
    },
    {
        "title": "Bahasa Indonesia (Indonesia)",
        "value": "id-ID"
    },
    {
        "title": "Íslenska (Ísland)",
        "value": "is-IS"
    },
    {
        "title": "Jawa (Latin, Indonesia)",
        "value": "jv-ID"
    },
    {
        "title": "ქართული (საქართველო)",
        "value": "ka-GE"
    },
    {
        "title": "Қазақ (Қазақстан)",
        "value": "kk-KZ"
    },
    {
        "title": "ខ្មែរ (កម្ពុជា)",
        "value": "km-KH"
    },
    {
        "title": "ಕನ್ನಡ (ಭಾರತ)",
        "value": "kn-IN"
    },
    {
        "title": "ລາວ (ລາວ)",
        "value": "lo-LA"
    },
    {
        "title": "Lietuvių (Lietuva)",
        "value": "lt-LT"
    },
    {
        "title": "Latviešu (Latvija)",
        "value": "lv-LV"
    },
    {
        "title": "Македонски (Северна Македонија)",
        "value": "mk-MK"
    },
    {
        "title": "മലയാളം (ഇന്ത്യ)",
        "value": "ml-IN"
    },
    {
        "title": "Монгол (Монгол)",
        "value": "mn-MN"
    },
    {
        "title": "मराठी (भारत)",
        "value": "mr-IN"
    },
    {
        "title": "Bahasa Melayu (Malaysia)",
        "value": "ms-MY"
    },
    {
        "title": "Malti (Malta)",
        "value": "mt-MT"
    },
    {
        "title": "မြန်မာ (မြန်မာ)",
        "value": "my-MM"
    },
    {
        "title": "Norsk bokmål (Norge)",
        "value": "nb-NO"
    },
    {
        "title": "नेपाली (नेपाल)",
        "value": "ne-NP"
    },
    {
        "title": "Nederlands (België)",
        "value": "nl-BE"
    },
    {
        "title": "Nederlands (Nederland)",
        "value": "nl-NL"
    },
    {
        "title": "ਪੰਜਾਬੀ (ਭਾਰਤ)",
        "value": "pa-IN"
    },
    {
        "title": "Polski (Polska)",
        "value": "pl-PL"
    },
    {
        "title": "پښتو (افغانستان)",
        "value": "ps-AF"
    },
    {
        "title": "Română (România)",
        "value": "ro-RO"
    },
    {
        "title": "සිංහල (ශ්‍රී ලංකාව)",
        "value": "si-LK"
    },
    {
        "title": "Slovenčina (Slovensko)",
        "value": "sk-SK"
    },
    {
        "title": "Slovenščina (Slovenija)",
        "value": "sl-SI"
    },
    {
        "title": "Soomaali (Soomaaliya)",
        "value": "so-SO"
    },
    {
        "title": "Shqip (Shqipëri)",
        "value": "sq-AL"
    }
]

async function fetch_model() {

    let models: any[] = []
    try {
        models = voices.map((item) => {
            return {
                "title": `${item.title}`,
                "value": `${item.value}`
            }
        })
    } catch (err) {
        console.log(err)
    }

    return models
}

export default async function main(req: Request) {
    const { options: { text } } = await req.json()

    let models = await fetch_model()

    return JSON.stringify(models)
}



