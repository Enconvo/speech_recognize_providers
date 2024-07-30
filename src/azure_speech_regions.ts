import { environment } from "@enconvo/api";
import fs from 'fs'


const voices = [
    {
      "title": "South Africa North",
      "value": "southafricanorth"
    },
    {
      "title": "East Asia",
      "value": "eastasia"
    },
    {
      "title": "Southeast Asia",
      "value": "southeastasia"
    },
    {
      "title": "Australia East",
      "value": "australiaeast"
    },
    {
      "title": "Central India",
      "value": "centralindia"
    },
    {
      "title": "Japan East",
      "value": "japaneast"
    },
    {
      "title": "Japan West",
      "value": "japanwest"
    },
    {
      "title": "Korea Central",
      "value": "koreacentral"
    },
    {
      "title": "Canada Central",
      "value": "canadacentral"
    },
    {
      "title": "North Europe",
      "value": "northeurope"
    },
    {
      "title": "West Europe",
      "value": "westeurope"
    },
    {
      "title": "France Central",
      "value": "francecentral"
    },
    {
      "title": "Germany West Central",
      "value": "germanywestcentral"
    },
    {
      "title": "Norway East",
      "value": "norwayeast"
    },
    {
      "title": "Sweden Central",
      "value": "swedencentral"
    },
    {
      "title": "Switzerland North",
      "value": "switzerlandnorth"
    },
    {
      "title": "Switzerland West",
      "value": "switzerlandwest"
    },
    {
      "title": "UK South",
      "value": "uksouth"
    },
    {
      "title": "UAE North",
      "value": "uaenorth"
    },
    {
      "title": "Brazil South",
      "value": "brazilsouth"
    },
    {
      "title": "Qatar Central",
      "value": "qatarcentral"
    },
    {
      "title": "Central US",
      "value": "centralus"
    },
    {
      "title": "East US",
      "value": "eastus"
    },
    {
      "title": "East US 2",
      "value": "eastus2"
    },
    {
      "title": "North Central US",
      "value": "northcentralus"
    },
    {
      "title": "South Central US", 
      "value": "southcentralus"
    },
    {
      "title": "West Central US",
      "value": "westcentralus"
    },
    {
      "title": "West US",
      "value": "westus"
    },
    {
      "title": "West US 2",
      "value": "westus2"
    },
    {
      "title": "West US 3",
      "value": "westus3"
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



