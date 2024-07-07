import { environment } from "@enconvo/api";
import fs from 'fs'


const voices = [
  {
    "title": "English",
    "value": "en"
  },
  {
    "title": "English (US)",
    "value": "en-US"
  },
  {
    "title": "English (Australia)",
    "value": "en-AU"
  },
  {
    "title": "English (UK)",
    "value": "en-GB"
  },
  {
    "title": "English (New Zealand)",
    "value": "en-NZ"
  },
  {
    "title": "English (India)",
    "value": "en-IN"
  },
  {
    "title": "日本語",
    "value": "ja"
  },
  {
    "title": "中文（简体）",
    "value": "zh"
  },
  {
    "title": "中文（简体）",
    "value": "zh-CN"
  },
  {
    "title": "中文（简体）",
    "value": "zh-Hans"
  },
  {
    "title": "中文（繁體）",
    "value": "zh-TW"
  },
  {
    "title": "中文（繁體）",
    "value": "zh-Hant"
  },
  {
    "title": "한국어",
    "value": "ko"
  },
  {
    "title": "한국어 (대한민국)",
    "value": "ko-KR"
  },
  {
    "title": "Français",
    "value": "fr"
  },
  {
    "title": "Français (Canada)",
    "value": "fr-CA"
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
    "title": "Dansk (Danmark)",
    "value": "da-DK"
  },
  {
    "title": "Nederlands",
    "value": "nl"
  },
  {
    "title": "Eesti",
    "value": "et"
  },
  {
    "title": "Suomi",
    "value": "fi"
  },
  {
    "title": "Vlaams",
    "value": "nl-BE"
  },
  {
    "title": "Deutsch",
    "value": "de"
  },
  {
    "title": "Schweizerdeutsch",
    "value": "de-CH"
  },
  {
    "title": "Ελληνικά",
    "value": "el"
  },
  {
    "title": "हिन्दी",
    "value": "hi"
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
    "title": "Italiano",
    "value": "it"
  },
  {
    "title": "Latviešu",
    "value": "lv"
  },
  {
    "title": "Lietuvių",
    "value": "lt"
  },
  {
    "title": "Bahasa Melayu",
    "value": "ms"
  },
  {
    "title": "Norsk",
    "value": "no"
  },
  {
    "title": "Polski",
    "value": "pl"
  },
  {
    "title": "Português",
    "value": "pt"
  },
  {
    "title": "Português (Brasil)",
    "value": "pt-BR"
  },
  {
    "title": "Română",
    "value": "ro"
  },
  {
    "title": "Русский",
    "value": "ru"
  },
  {
    "title": "Slovenčina",
    "value": "sk"
  },
  {
    "title": "Español",
    "value": "es"
  },
  {
    "title": "Español (Latinoamérica)",
    "value": "es-419"
  },
  {
    "title": "Svenska",
    "value": "sv"
  },
  {
    "title": "Svenska (Sverige)",
    "value": "sv-SE"
  },
  {
    "title": "ไทย",
    "value": "th"
  },
  {
    "title": "ไทย (ประเทศไทย)",
    "value": "th-TH"
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



