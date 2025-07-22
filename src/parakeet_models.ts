import { NativeAPI } from "@enconvo/api"

export default async function main() {
    const resp = await NativeAPI.callCommand("mlx_manage|hf_manage", {
        method: 'list_models'
    })
    return JSON.stringify(resp.data.models)
}
