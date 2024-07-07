import { environment } from "@enconvo/api";
import fs from 'fs'


const voices = [
    {
      "title": "中文（简体，中国）",
      "value": "zh-CHS"
    },
    {
      "title": "中文（简体，香港）",
      "value": "zh-HK"
    },
    {
      "title": "中文（简体，台湾）",
      "value": "zh-TWN"
    },
    {
      "title": "中文（粤语，繁体，香港）",
      "value": "yue"
    },
    {
      "title": "English (United States)",
      "value": "en"
    },
    {
      "title": "English (United Kingdom)",
      "value": "en-GBR"
    },
    {
      "title": "English (Australia)",
      "value": "en-AUS"
    },
    {
      "title": "English (Canada)",
      "value": "en-CA"
    },
    {
      "title": "English (India)",
      "value": "en-IND"
    },
    {
      "title": "日本語",
      "value": "ja"
    },
    {
      "title": "한국어",
      "value": "ko"
    },
    {
      "title": "Español (España)",
      "value": "es"
    },
    {
      "title": "Español (México)",
      "value": "es-MEX"
    },
    {
      "title": "Français (France)",
      "value": "fr"
    },
    {
      "title": "Français (Canada)",
      "value": "fr-CA"
    },
    {
      "title": "Deutsch",
      "value": "de"
    },
    {
      "title": "Italiano",
      "value": "it"
    },
    {
      "title": "Português (Brasil)",
      "value": "pt-BRA"
    },
    {
      "title": "Português (Portugal)",
      "value": "pt"
    },
    {
      "title": "Русский",
      "value": "ru"
    },
    {
      "title": "Nederlands",
      "value": "nl"
    },
    {
      "title": "Polski",
      "value": "pl"
    },
    {
      "title": "العربية (السعودية)",
      "value": "ar"
    },
    {
      "title": "العربية (الإمارات)",
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
      "title": "العربية (المغرب)",
      "value": "ar-MA"
    },
    {
      "title": "العربية (عُمان)",
      "value": "ar-OM"
    },
    {
      "title": "العربية (فلسطين)",
      "value": "ar-PS"
    },
    {
      "title": "العربية (قطر)",
      "value": "ar-QA"
    },
    {
      "title": "العربية (تونس)",
      "value": "ar-TN"
    },
    {
      "title": "Български",
      "value": "bg"
    },
    {
      "title": "Català",
      "value": "ca"
    },
    {
      "title": "Čeština",
      "value": "cs"
    },
    {
      "title": "Dansk",
      "value": "da"
    },
    {
      "title": "Ελληνικά",
      "value": "el"
    },
    {
      "title": "Suomi",
      "value": "fi"
    },
    {
      "title": "עברית",
      "value": "he"
    },
    {
      "title": "हिन्दी",
      "value": "hi"
    },
    {
      "title": "Hrvatski",
      "value": "hr"
    },
    {
      "title": "Magyar",
      "value": "hu"
    },
    {
      "title": "Bahasa Indonesia",
      "value": "id"
    },
    {
      "title": "Lietuvių",
      "value": "lt-LT"
    },
    {
      "title": "Latviešu",
      "value": "lv-LV"
    },
    {
      "title": "Norsk Bokmål",
      "value": "no"
    },
    {
      "title": "Română",
      "value": "ro"
    },
    {
      "title": "Slovenčina",
      "value": "sk"
    },
    {
      "title": "Slovenščina",
      "value": "sl"
    },
    {
      "title": "Српски",
      "value": "sr-RS"
    },
    {
      "title": "Svenska",
      "value": "sv"
    },
    {
      "title": "ภาษาไทย",
      "value": "th"
    },
    {
      "title": "Türkçe",
      "value": "tr"
    },
    {
      "title": "Українська",
      "value": "uk"
    },
    {
      "title": "Tiếng Việt",
      "value": "vi"
    },
    {
      "title": "Afrikaans",
      "value": "af-ZA"
    },
    {
      "title": "አማርኛ",
      "value": "am-ET"
    },
    {
      "title": "Azərbaycan",
      "value": "az-AZ"
    },
    {
      "title": "বাংলা (বাংলাদেশ)",
      "value": "bn-BD"
    },
    {
      "title": "বাংলা (ভারত)",
      "value": "bn-IN"
    },
    {
      "title": "Eesti",
      "value": "et-EE"
    },
    {
      "title": "Euskara",
      "value": "eu-ES"
    },
    {
      "title": "فارسی",
      "value": "fa-IR"
    },
    {
      "title": "Filipino",
      "value": "tl"
    },
    {
      "title": "Galego",
      "value": "gl-ES"
    },
    {
      "title": "ગુજરાતી",
      "value": "gu-IN"
    },
    {
      "title": "Հայերեն",
      "value": "hy-AM"
    },
    {
      "title": "Íslenska",
      "value": "is-IS"
    },
    {
      "title": "Basa Jawa",
      "value": "jv-ID"
    },
    {
      "title": "ქართული",
      "value": "ka-GE"
    },
    {
      "title": "ខ្មែរ",
      "value": "km-KH"
    },
    {
      "title": "ಕನ್ನಡ",
      "value": "kn-IN"
    },
    {
      "title": "ລາວ",
      "value": "lo"
    },
    {
      "title": "Македонски",
      "value": "mk-MK"
    },
    {
      "title": "മലയാളം",
      "value": "ml-IN"
    },
    {
      "title": "Монгол",
      "value": "mn-MN"
    },
    {
      "title": "मराठी",
      "value": "mr-IN"
    },
    {
      "title": "Bahasa Melayu",
      "value": "ms"
    },
    {
      "title": "မြန်မာ",
      "value": "my-MM"
    },
    {
      "title": "नेपाली",
      "value": "ne-NP"
    },
    {
      "title": "ਪੰਜਾਬੀ",
      "value": "pa-guru-IN"
    },
    {
      "title": "සිංහල",
      "value": "si-LK"
    },
    {
      "title": "Shqip",
      "value": "sq-AL"
    },
    {
      "title": "Basa Sunda",
      "value": "su-ID"
    },
    {
      "title": "Kiswahili (Kenya)",
      "value": "sw-KE"
    },
    {
      "title": "Kiswahili (Tanzania)",
      "value": "sw-TZ"
    },
    {
      "title": "தமிழ் (இந்தியா)",
      "value": "ta"
    },
    {
      "title": "தமிழ் (இலங்கை)",
      "value": "ta-LK"
    },
    {
      "title": "தமிழ் (மலேசியா)",
      "value": "ta-MY"
    },
    {
      "title": "தமிழ் (சிங்கப்பூர்)",
      "value": "ta-SG"
    },
    {
      "title": "తెలుగు",
      "value": "te"
    },
    {
      "title": "اردو (بھارت)",
      "value": "ur-IN"
    },
    {
      "title": "اردو (پاکستان)",
      "value": "ur-PK"
    },
    {
      "title": "O'zbek",
      "value": "uz-UZ"
    },
    {
      "title": "isiZulu",
      "value": "zu-ZA"
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

    const modelCacheDir = environment.assetsPath + `/models`
    if (!fs.existsSync(modelCacheDir)) {
        fs.mkdirSync(modelCacheDir, { recursive: true })
    }
    const modelCachePath = `${modelCacheDir}/${environment.commandName}.json`

    console.log('text', text, modelCachePath)
    fs.existsSync(modelCachePath) || fs.writeFileSync(modelCachePath, '[]')

    const modelContent = fs.readFileSync(modelCachePath, 'utf8')
    let models = JSON.parse(modelContent)

    try {
        if (text === 'refresh' || models.length === 0) {
            models = await fetch_model()
            fs.writeFileSync(modelCachePath, JSON.stringify(models))
        }
    } catch (err) {
        console.log(err)
    }

    return JSON.stringify(models)
}



