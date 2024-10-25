import { environment } from "@enconvo/api";
import fs from 'fs'


const voices = [
  {
    "title": "Auto",
    "value": "auto"
  },
  {
    "title": "Global English",
    "value": "en"
  },
  {
    "title": "Australian English",
    "value": "en_au"
  },
  {
    "title": "British English",
    "value": "en_uk"
  },
  {
    "title": "American English",
    "value": "en_us"
  },
  {
    "title": "Spanish(Español)",
    "value": "es"
  },
  {
    "title": "French(Français)",
    "value": "fr"
  },
  {
    "title": "German(Deutsch)",
    "value": "de"
  },
  {
    "title": "Italian(Italiano)",
    "value": "it"
  },
  {
    "title": "Portuguese(Português)",
    "value": "pt"
  },
  {
    "title": "Dutch(Nederlands)",
    "value": "nl"
  },
  {
    "title": "Afrikaans(Afrikaans)",
    "value": "af"
  },
  {
    "title": "Albanian(Shqip)",
    "value": "sq"
  },
  {
    "title": "Amharic(አማርኛ)",
    "value": "am"
  },
  {
    "title": "Arabic(العربية)",
    "value": "ar"
  },
  {
    "title": "Armenian(Հայերեն)",
    "value": "hy"
  },
  {
    "title": "Assamese(অসমীয়া)",
    "value": "as"
  },
  {
    "title": "Azerbaijani(Azərbaycan)",
    "value": "az"
  },
  {
    "title": "Bashkir(Башҡорт)",
    "value": "ba"
  },
  {
    "title": "Basque(Euskara)",
    "value": "eu"
  },
  {
    "title": "Belarusian(Беларуская)",
    "value": "be"
  },
  {
    "title": "Bengali(বাংলা)",
    "value": "bn"
  },
  {
    "title": "Bosnian(Bosanski)",
    "value": "bs"
  },
  {
    "title": "Breton(Brezhoneg)",
    "value": "br"
  },
  {
    "title": "Bulgarian(Български)",
    "value": "bg"
  },
  {
    "title": "Burmese(မြန်မာ)",
    "value": "my"
  },
  {
    "title": "Catalan(Català)",
    "value": "ca"
  },
  {
    "title": "Chinese(中文)",
    "value": "zh"
  },
  {
    "title": "Croatian(Hrvatski)",
    "value": "hr"
  },
  {
    "title": "Czech(Čeština)",
    "value": "cs"
  },
  {
    "title": "Danish(Dansk)",
    "value": "da"
  },
  {
    "title": "Estonian(Eesti)",
    "value": "et"
  },
  {
    "title": "Faroese(Føroyskt)",
    "value": "fo"
  },
  {
    "title": "Finnish(Suomi)",
    "value": "fi"
  },
  {
    "title": "Galician(Galego)",
    "value": "gl"
  },
  {
    "title": "Georgian(ქართული)",
    "value": "ka"
  },
  {
    "title": "Greek(Ελληνικά)",
    "value": "el"
  },
  {
    "title": "Gujarati(ગુજરાતી)",
    "value": "gu"
  },
  {
    "title": "Haitian(Kreyòl ayisyen)",
    "value": "ht"
  },
  {
    "title": "Hausa(Hausa)",
    "value": "ha"
  },
  {
    "title": "Hawaiian(ʻŌlelo Hawaiʻi)",
    "value": "haw"
  },
  {
    "title": "Hebrew(עברית)",
    "value": "he"
  },
  {
    "title": "Hindi(हिन्दी)",
    "value": "hi"
  },
  {
    "title": "Hungarian(Magyar)",
    "value": "hu"
  },
  {
    "title": "Icelandic(Íslenska)",
    "value": "is"
  },
  {
    "title": "Indonesian(Bahasa Indonesia)",
    "value": "id"
  },
  {
    "title": "Japanese(日本語)",
    "value": "ja"
  },
  {
    "title": "Javanese(Basa Jawa)",
    "value": "jw"
  },
  {
    "title": "Kannada(ಕನ್ನಡ)",
    "value": "kn"
  },
  {
    "title": "Kazakh(Қазақ)",
    "value": "kk"
  },
  {
    "title": "Khmer(ខ្មែរ)",
    "value": "km"
  },
  {
    "title": "Korean(한국어)",
    "value": "ko"
  },
  {
    "title": "Lao(ລາວ)",
    "value": "lo"
  },
  {
    "title": "Latin(Latina)",
    "value": "la"
  },
  {
    "title": "Latvian(Latviešu)",
    "value": "lv"
  },
  {
    "title": "Lingala(Lingála)",
    "value": "ln"
  },
  {
    "title": "Lithuanian(Lietuvių)",
    "value": "lt"
  },
  {
    "title": "Luxembourgish(Lëtzebuergesch)",
    "value": "lb"
  },
  {
    "title": "Macedonian(Македонски)",
    "value": "mk"
  },
  {
    "title": "Malagasy(Malagasy)",
    "value": "mg"
  },
  {
    "title": "Malay(Bahasa Melayu)",
    "value": "ms"
  },
  {
    "title": "Malayalam(മലയാളം)",
    "value": "ml"
  },
  {
    "title": "Maltese(Malti)",
    "value": "mt"
  },
  {
    "title": "Maori(Māori)",
    "value": "mi"
  },
  {
    "title": "Marathi(मराठी)",
    "value": "mr"
  },
  {
    "title": "Mongolian(Монгол)",
    "value": "mn"
  },
  {
    "title": "Nepali(नेपाली)",
    "value": "ne"
  },
  {
    "title": "Norwegian(Norsk)",
    "value": "no"
  },
  {
    "title": "Norwegian Nynorsk(Nynorsk)",
    "value": "nn"
  },
  {
    "title": "Occitan(Occitan)",
    "value": "oc"
  },
  {
    "title": "Panjabi(ਪੰਜਾਬੀ)",
    "value": "pa"
  },
  {
    "title": "Pashto(پښتو)",
    "value": "ps"
  },
  {
    "title": "Persian(فارسی)",
    "value": "fa"
  },
  {
    "title": "Polish(Polski)",
    "value": "pl"
  },
  {
    "title": "Romanian(Română)",
    "value": "ro"
  },
  {
    "title": "Russian(Русский)",
    "value": "ru"
  },
  {
    "title": "Sanskrit(संस्कृत)",
    "value": "sa"
  },
  {
    "title": "Serbian(Српски)",
    "value": "sr"
  },
  {
    "title": "Shona(chiShona)",
    "value": "sn"
  },
  {
    "title": "Sindhi(سنڌي)",
    "value": "sd"
  },
  {
    "title": "Sinhala(සිංහල)",
    "value": "si"
  },
  {
    "title": "Slovak(Slovenčina)",
    "value": "sk"
  },
  {
    "title": "Slovenian(Slovenščina)",
    "value": "sl"
  },
  {
    "title": "Somali(Soomaali)",
    "value": "so"
  },
  {
    "title": "Sundanese(Basa Sunda)",
    "value": "su"
  },
  {
    "title": "Swahili(Kiswahili)",
    "value": "sw"
  },
  {
    "title": "Swedish(Svenska)",
    "value": "sv"
  },
  {
    "title": "Tagalog(Tagalog)",
    "value": "tl"
  },
  {
    "title": "Tajik(Тоҷикӣ)",
    "value": "tg"
  },
  { "title": "Tamil(தமிழ்)", "value": "ta" }, { "title": "Tatar(Татар)", "value": "tt" }, { "title": "Telugu(తెలుగు)", "value": "te" }, { "title": "Thai(ไทย)", "value": "th" }, { "title": "Tibetan(བོད་སྐད་)", "value": "bo" }, { "title": "Turkish(Türkçe)", "value": "tr" }, { "title": "Turkmen(Türkmen)", "value": "tk" }, { "title": "Ukrainian(Українська)", "value": "uk" }, { "title": "Urdu(اردو)", "value": "ur" }, { "title": "Uzbek(O'zbek)", "value": "uz" }, { "title": "Vietnamese(Tiếng Việt)", "value": "vi" }, { "title": "Welsh(Cymraeg)", "value": "cy" }, { "title": "Yiddish(ייִדיש)", "value": "yi" }, { "title": "Yoruba(Yorùbá)", "value": "yo" }
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



