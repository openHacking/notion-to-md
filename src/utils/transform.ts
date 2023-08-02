import { ListBlockChildrenResponseResults } from "../types";

const blockTypeMap:any = {
    "text": "paragraph",
    "bulleted_list": "bulleted_list_item",
    "numbered_list": "numbered_list_item",
    "header": "heading_1",
    "sub_header": "heading_2",
    "sub_sub_header": "heading_3",
    // "quote": "quote",
    // "image": "image",
    // "toggle": "toggle",
    // "code": "code",
    // "divider": "divider",
    // "table": "table",
    // "to_do": "to_do",
}

/**
 * BlockType
  | "video"
  | "file"
  | "pdf"
  | "table"
  | "bookmark"
  | "embed"
  | "equation"
  | "divider"
  | "to_do"
  | "synced_block"
  | "column_list"
  | "column"
  | "link_preview"
  | "link_to_page"

  | ""
  | "template"
  | "child_page"
  | "child_database"
  | "code"
  | "callout"
  | "breadcrumb"
  | "table_of_contents"
  | "link_to_page"
  | "audio"
  | "unsupported"
 *
 * @param data
 * @param pageId
 * @returns
 */
export function convertBlocksResponseData(data:any, pageId:string) {
    const blockIdList = data[pageId].value.value.content;
    const blocks: any[] = []
    blockIdList.forEach((id:string) => {
        const blockItem = data[id]
        blocks.push(blockItem)
    })

    const transBlocks = blocks.map((item) => {
        const blockData = item.value.value;
        const blockType = blockTypeMap[blockData.type]

        let baseBlockData = {
            type: blockType,
            object: "block",
            id: blockData.id,
            created_time: new Date(blockData.created_time).toISOString(),
            created_by: {
                object: "user",
                id: blockData.created_by_id,
            },
            last_edited_time: new Date(blockData.last_edited_time).toISOString(),
            last_edited_by: {
                object: "user",
                id: blockData.last_edited_by_id,
            },
            has_children: false,
            archived: false,

            parent: {
                type: "page_id",
                page_id: blockData.parent_id,
            },
        }

        const newBlockData = createBlockData(blockData,blockType);

        return Object.assign(baseBlockData,newBlockData);
    });

    return transBlocks;
}


function createBlockData(blockData:any,blockType:string) {
    switch (blockType) {
        case "heading_1":
        case "heading_2":
        case "heading_3":
            return headingBlock(blockData,blockType)
            break;

        case "paragraph":
        case "quote":
        case "bulleted_list_item":
            return paragraphBlock(blockData,blockType)
            break;

        case "numbered_list_item":
            return numberedListItemBlock(blockData,blockType)
            break;
        case "image":
            return imageBlock(blockData,blockType)
            break;
        case "toggle":
            return toggleBlock(blockData,blockType)
            break;

        default:
            return defaultBlock(blockType)
            break;
    }
}




function convertTextList(textList:any[]) {

    if(!textList) return []

    function processAnnotations(annotations:any) {
        const result = {
            bold: false,
            italic: false,
            strikethrough: false,
            underline: false,
            code: false,
            color: "default"
        };

        let link = null
        if(annotations) {
            for (const annotation of annotations) {

                if (annotation.includes("b")) {
                    result.bold = true;
                }
                if (annotation.includes("i")) {
                    result.italic = true;
                }
                if (annotation.includes("s")) {
                    result.strikethrough = true;
                }
                if (annotation.includes("_")) {
                    result.underline = true;
                }
                if (annotation.includes("c")) {
                    result.code = true;
                }
                if (annotation.includes("h")) {
                    result.color = annotation[annotation.indexOf("h") + 1];
                }
                if (annotation.includes("a")) {
                    link = annotation[annotation.indexOf("a") + 1];
                }
            }
        }

        return {
            annotationObj:result,
            link
        };
    }

    const richTextList = [];
    for (const [text, annotations] of textList) {
        const {annotationObj,link} = processAnnotations(annotations);
        const textObj = {
            type: "text",
            text: {
                content: text,
                link
            },
            annotations: annotationObj,
            plain_text: text,
            href:link
        };
        richTextList.push(textObj);
    }

    return richTextList;
}


function headingBlock(blockData:any,blockType:string) {
    const title = blockData.properties.title
    const rich_text = convertTextList(title)
    return {
        [blockType]: {
            rich_text,
            "is_toggleable": false,
            color: "default",
        },
    }
}

/**
 * @param blockType
 * @param richTextContent
 * @returns
 */
function paragraphBlock(blockData:any,blockType:string) {
    const title = blockData.properties && blockData.properties.title
    const rich_text = convertTextList(title)
    return {
        [blockType]: {
            rich_text,
            color: "default",
        },
    }
}
/**
 * @param blockType
 * @param richTextContent
 * @returns
 */
function numberedListItemBlock(blockData:any,blockType:string) {
    const title = blockData.properties.title
    const rich_text = convertTextList(title)
    return {
        [blockType]: {
            rich_text,
            color: "default",
            "number": 1
        },
    }
}

function imageBlock(blockData:any,blockType:string) {
    const url = blockData.properties.source[0][0]
    return {
        [blockType]: {
            caption: [],
            type: "external",
            external: {
                url
            }
        },
    }
}
function toggleBlock(blockData:any,blockType:string) {
    const url = blockData.properties.source[0][0]
    return {
        has_children: true,
        [blockType]: {
            caption: [],
            type: "external",
            external: {
                url
            }
        },
    }
}

function defaultBlock(blockType:string) {
    return {
        [blockType]: {
            rich_text: [
                {
                    type: "text",
                    text: {
                        content: 'UNSUPPORTED',
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
                    plain_text: 'UNSUPPORTED',
                    href: null,
                },
            ],
            color: "default",
        },
    }
}
