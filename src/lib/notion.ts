import { Client } from "@notionhq/client";

export interface QSRProperty {
    id: string;
    name: string;
    address: string;
    price?: number;
    capRate?: number;
    rentIncreases?: string;
    options?: string;
    termRemaining?: string;
    leaseType?: string;
    leaseCommencement?: string;
    leaseExpiration?: string;
    newConstruction?: boolean;
    pop1Mile?: number;
    pop3Mile?: number;
    medIncome?: number;
    vpd?: number;
    buildingSize?: number;
    lotSize?: number;
    guarantor?: string;
    noi?: number;
    propertyStats?: string;
    imageUrl?: string;
    previouslyBought?: boolean;
    salePdfUrl?: string;
}

const notion = new Client({ auth: process.env.NOTION_TOKEN });

export async function fetchQSRProperties(databaseId: string): Promise<QSRProperty[]> {
  const response = await notion.databases.query({ database_id: databaseId });

    return response.results.map((page: any) => {
    const props = page.properties;

    const getText = (label: string) =>
      props[label]?.rich_text?.[0]?.plain_text ?? undefined;

    const getTitle = (label: string) =>
      props[label]?.title?.[0]?.plain_text ?? undefined;

    const getNumber = (label: string) => {
      const val = props[label]?.number;
      return typeof val === "number" ? val : undefined;
    };

    const getSelect = (label: string) =>
      props[label]?.select?.name ?? undefined;

    const getFileUrl = (label: string) => {
      const files = props[label]?.files;
      if (Array.isArray(files) && files.length > 0) {
        const file = files[0];
        if (file.type === "external") return file.external.url;
        if (file.type === "file") return file.file.url;
      }
      return undefined;
    };

    const getCheckbox = (label: string) => props[label]?.checkbox ?? false;
    
    

    return {
      id: page.id,
      name: getTitle("Name"),
      address: getText("Address"),
      capRate: getNumber("Cap Rate"),
      price: getNumber("Price"),
      noi: getNumber("NOI"),
      leaseType: getText("Lease Type"),
      rentIncreases: getText("Rent Increases"),
      options: getText("Options"),
      termRemaining: getText("Term Remaining"),
      leaseCommencement: getText("Lease Commencement"),
      leaseExpiration: getText("Lease Expiration"),
      newConstruction: props["New Construction?"]?.checkbox ?? false,
      pop1Mile: getNumber("Pop 1 mile"),
      pop3Mile: getNumber("Pop 3 mile"),
      medIncome: getNumber("Med Income"),
      vpd: getNumber("VPD"),
      buildingSize: getText("Building size"),
      lotSize: getText("Lot Size"),
      guarantor: getText("Guarantor"),
      propertyStats: getText("Property Stats"),
      imageUrl: getFileUrl("Image"),
      previouslyBought: getCheckbox("Previously Bought"),
      salePdfUrl: getFileUrl("Sale PDF Link"),
    };
  });
}
