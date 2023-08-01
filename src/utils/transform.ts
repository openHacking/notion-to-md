import { ListBlockChildrenResponseResults } from "../types";

const blockTypeMap:any = {
    "text": "paragraph",
    "bulleted_list": "bulleted_list_item"
}

export function convertBlocksResponseData(data:any, pageId:string):ListBlockChildrenResponseResults {
    const blockIdList = data[pageId].value.value.content;
    const blocks: any[] = []
    blockIdList.forEach((id:string) => {
        const blockItem = data[id]
        blocks.push(blockItem)
    })

    const transBlocks:ListBlockChildrenResponseResults = blocks.map((item) => {
        const blockData = item.value.value;
        const blockType = blockTypeMap[blockData.type]
        const richTextContent = blockData.properties.title[0][0];

        return {
            object: "block",
            id: blockData.id,
            parent: {
                type: "page_id",
                page_id: blockData.parent_id,
            },
            created_time: new Date(blockData.created_time).toISOString(),
            last_edited_time: new Date(blockData.last_edited_time).toISOString(),
            created_by: {
                object: "user",
                id: blockData.created_by_id,
            },
            last_edited_by: {
                object: "user",
                id: blockData.last_edited_by_id,
            },
            has_children: false,
            archived: false,
            type: blockType,
            [blockType]: {
                rich_text: [
                    {
                        type: "text",
                        text: {
                            content: richTextContent,
                            link: null,
                        },
                        annotations: {
                            bold: false,
                            italic: false,
                            strikethrough: false,
                            underline: false,
                            code: false,
                            color: "default",
                        },
                        plain_text: richTextContent,
                        href: null,
                    },
                ],
                color: "default",
            },
        };
    });

    return transBlocks;
}