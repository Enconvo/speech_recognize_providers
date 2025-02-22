import { DropdownListCache } from "@enconvo/api"



const models: DropdownListCache.ModelOutput[] = [
    {
        "title": "Nova-3",
        "value": "nova-3"
    },
    {
        "title": "Nova-2",
        "value": "nova-2"
    },
    {
        "title": "Nova",
        "value": "nova"
    },
    {
        "title": "Enhanced",
        "value": "enhanced"
    },
    {
        "title": "Base",
        "value": "base"
    }
]

/**
 * Fetches models from the API and transforms them into ModelOutput format
 * @param url - API endpoint URL
 * @param api_key - API authentication key
 * @returns Promise<ModelOutput[]> - Array of processed model data
 */
async function fetchModels(url: string, api_key: string, type: string): Promise<DropdownListCache.ModelOutput[]> {
    // console.log("fetchModels", url, api_key, type)
    try {

        return models

    } catch (error) {
        console.error('Error fetching models:', error)
        return []
    }
}

/**
 * Main handler function for the API endpoint
 * @param req - Request object containing options
 * @returns Promise<string> - JSON string of model data
 */
export default async function main(req: Request): Promise<string> {
    let options: any = await req.json()
    options.api_key = options.openAIApiKey

    const url = 'https://api.deepgram.com/v1/models'

    options.url = url

    const modelCache = new DropdownListCache(fetchModels)

    const models = await modelCache.getModelsCache(options)
    return JSON.stringify(models)
}
