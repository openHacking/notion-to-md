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
  | "bookmark"
  | "embed"
  | "equation"
  | "divider"
  | "synced_block"
  | "column_list"
  | "column"
  | "link_preview"
  | "link_to_page"

  | ""
  | "template"
  | "child_page"
  | "child_database"
  | "callout"
  | "breadcrumb"
  | "table_of_contents"
  | "link_to_page"
  | "audio"
  | "unsupported"
 *
 * @param data
 * @param id
 * @returns
 */
export function convertBlocksResponseData(data:any, id:string) {
    const parentData = data[id].value.value ? data[id].value.value : data[id].value;
    const blockIdList = parentData.content;
    const parentType = parentData.type === 'page' ? 'page_id' : 'block_id'
    const blocks: any[] = []
    blockIdList.forEach((id:string) => {
        const blockItem = data[id]
        if(blockItem){
            blocks.push(blockItem)
        }
    })

    const transBlocks = blocks.map((item) => {
        const blockData = item.value.value ? item.value.value : item.value;
        const has_children = blockData.content ? true : false;
        const blockType = blockTypeMap[blockData.type] || blockData.type;

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
            has_children,
            archived: false,

            parent: {
                type: parentType,
                [parentType]: blockData.parent_id,
            },
        }

        const newBlockData = createBlockData(blockData,blockType,parentData);

        return Object.assign(baseBlockData,newBlockData);
    });

    return transBlocks;
}


function createBlockData(blockData:any,blockType:string,parentData:any) {
    switch (blockType) {
        case "heading_1":
        case "heading_2":
        case "heading_3":
            return headingBlock(blockData,blockType)
            break;

        case "paragraph":
        case "quote":
        case "toggle":
        case "bulleted_list_item":
            return paragraphBlock(blockData,blockType)
            break;

        case "numbered_list_item":
            return numberedListItemBlock(blockData,blockType)
            break;
        case "image":
            return imageBlock(blockData,blockType)
            break;
        case "table":
            return tableBlock(blockData,blockType)
            break;
        case "table_row":
            return tableRowBlock(blockData,blockType,parentData)
            break;
        case "to_do":
            return todoBlock(blockData,blockType)
            break;
        case "code":
            return codeBlock(blockData,blockType)
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
function tableBlock(blockData:any,blockType:string) {
    const format = blockData.format;
    const table_block_column_order = format.table_block_column_order;
    return {
        [blockType]: {
            "table_width": table_block_column_order.length,
            "has_column_header": false,
            "has_row_header": false
        },
    }
}

/**
 * 
 * "table_block_column_order": [
                    "cu^j",
                    "kUBI"
                ]
 * "properties": {
                "cu^j": [
                    [
                        "Header1"
                    ]
                ],
                "kUBI": [
                    [
                        "Header2"
                    ]
                ]
            },
 * @param blockData 
 * @param blockType 
 * @returns 
 */
function tableRowBlock(blockData:any,blockType:string,parentData:any) {
    const format = parentData.format;
    const table_block_column_order = format.table_block_column_order;
    const properties = blockData.properties;

    const cells:any[] = table_block_column_order.map((columnOrder:string)=>{
        const columnTextList = properties[columnOrder];
        const rich_text = convertTextList(columnTextList);
        return rich_text;
    })

    return {
        [blockType]: {
            cells
        },
    }
}

function todoBlock(blockData:any,blockType:string) {
    const properties = blockData.properties;
    const title = properties &&properties.title;
    const checked = properties && properties.checked && properties.checked[0][0] === 'Yes' ? true : false;
    const rich_text = convertTextList(title);
    return {
        [blockType]: {
            rich_text,
            checked,
            color: "default",
        },
    }
}

/**
 * "properties": {
                "title": [
                    [
                        "This is a code block"
                    ]
                ],
                "language": [
                    [
                        "Shell"
                    ]
                ]
            },
            "format": {
                "code_wrap": true
            },
 * @param blockData 
 * @param blockType 
 * @returns 
 */
function codeBlock(blockData:any,blockType:string) {
    const properties = blockData.properties;
    const format = blockData.format;
    const title = properties && properties.title;
    const language = properties && properties.language && properties.language[0][0];
    const rich_text = convertTextList(title);
    return {
        [blockType]: {
            rich_text,
            caption: [],
            language
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

export function convertToUUID(str:string) {
    const parts = [
        str.substr(0, 8),
        str.substr(8, 4),
        str.substr(12, 4),
        str.substr(16, 4),
        str.substr(20, 12)
    ];

    return parts.join('-');
}
