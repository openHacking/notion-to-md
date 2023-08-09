const blockTypeMap:any = {
    "text": "paragraph",
    "bulleted_list": "bulleted_list_item",
    "numbered_list": "numbered_list_item",
    "header": "heading_1",
    "sub_header": "heading_2",
    "sub_sub_header": "heading_3",
    "page": "child_page"
}

/**
 * BlockType
  | "pdf"
  | "divider"
  | "synced_block"
  | "column_list"
  | "column"
  | "link_to_page"
  | "template"
  | "breadcrumb"
  | "link_to_page"
  | "unsupported"
 *
 * @param data
 * @param id
 * @returns
 */

const excludeBlocks = ['transclusion_container']

export function convertBlocksResponseData(data:any, id:string) {
    const parentData = data[id].value.value ? data[id].value.value : data[id].value;
    const blockIdList = parentData.content;
    const parentType = parentData.type === 'page' ? 'page_id' : 'block_id'
    const blocks: any[] = []
    blockIdList.forEach((id:string) => {
        const item = data[id]
        if(!item) return;

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

        const blockItem = Object.assign(baseBlockData,newBlockData);

        blocks.push(blockItem)
    })
    return blocks;
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
        case "child_page":
            return childPageBlock(blockData,blockType)
            break;
        case "alias":
            return aliasBlock(blockData,blockType)
            break;
        case "callout":
            return calloutBlock(blockData,blockType)
            break;
        case "bookmark":
            return bookmarkBlock(blockData,blockType)
            break;
        case "video":
        case "audio":
        case "file":
            return videoBlock(blockData,blockType)
            break;
        case "embed":
        case "tweet":
        case "gist":
            return embedBlock(blockData,blockType)
            break;
        case "external_object_instance":
            return externalObjectInstanceBlock(blockData,blockType)
            break;
        case "collection_view_page":
            return collectionViewPageBlock(blockData,blockType)
            break;
        case "equation":
            return equationBlock(blockData,blockType)
            break;
        case "transclusion_container":
        case "column":
        case "column_list":
        case "ai_block":
            return blankBlock(blockData,blockType)
            break;

        default:
            return defaultBlock(blockType)
            break;
    }
}




function convertTextList(blockData:any,textList:any[]) {

    if(!textList) return []

    function processAnnotations(annotations:any,text:string) {
        const result = {
            bold: false,
            italic: false,
            strikethrough: false,
            underline: false,
            code: false,
            color: "default"
        };

        let link = null;
        let type = 'text';
        let content = text;
        let info:any = {
            content,
            link
        }
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
                    info.link = link;
                }
                // mention a person or reminder a date,use id to replaced
                if (annotation.includes("u") || annotation.includes("d")) {
                    content = `[$$replace-start-${blockData.id}-end-replace$$]`;
                    info.content = content;
                }
                // mention a page
                if (annotation.includes("p")) {
                    const pageId = annotation[annotation.indexOf("p") + 1];
                    content = idToAliasLink(pageId);
                    link = content;
                    info.link = link;
                    info.content = content;
                }
                // 行内公式
                if (annotation.includes("e")) {
                    content = annotation[annotation.indexOf("e") + 1];
                    type = 'equation';
                    info = {
                        expression:content
                    }
                }
            }
        }

        return {
            annotationObj:result,
            link,
            content,
            type,
            info
        };
    }

    const richTextList = [];
    for (const [text, annotations] of textList) {
        const {annotationObj,link,content,type,info} = processAnnotations(annotations,text);
        const textObj = {
            type,
            [type]: info,
            annotations: annotationObj,
            plain_text:content,
            href: link
        };
        richTextList.push(textObj);
    }

    return richTextList;
}


function headingBlock(blockData:any,blockType:string) {
    const title = blockData.properties.title
    const rich_text = convertTextList(blockData,title)
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
    const rich_text = convertTextList(blockData,title)
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
    const rich_text = convertTextList(blockData,title)
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
        const rich_text = convertTextList(blockData,columnTextList);
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
    const rich_text = convertTextList(blockData,title);
    return {
        [blockType]: {
            rich_text,
            checked,
            color: "default",
        },
    }
}

/**
 * @param blockData 
 * @param blockType 
 * @returns 
 */
function codeBlock(blockData:any,blockType:string) {
    const properties = blockData.properties;
    const format = blockData.format;
    const title = properties && properties.title;
    const language = properties && properties.language && properties.language[0][0];
    const rich_text = convertTextList(blockData,title);
    return {
        [blockType]: {
            rich_text,
            caption: [],
            language
        },
    }
}

function childPageBlock(blockData:any,blockType:string) {
    const id = blockData.id;
    const properties = blockData.properties;
    const title = properties && properties.title && properties.title[0][0];
    const link = titleToUrl(title,id)
    return {
        type:'paragraph',
        paragraph: {
            rich_text: [
                {
                    type: "text",
                    text: {
                        content: title,
                        link: {
                            url: link
                        },
                    },
                    annotations: {
                        bold: false,
                        italic: false,
                        strikethrough: false,
                        underline: false,
                        code: false,
                        color: "default",
                    },
                    plain_text: title,
                    href: link,
                },
            ],
            color: "default",
        },
    }
}

function aliasBlock(blockData:any,blockType:string) {
    const format = blockData.format;
    const aliasId = format && format.alias_pointer && format.alias_pointer.id || '';
    const link = idToAliasLink(aliasId)
    const title = link
    return {
        type:'paragraph',
        paragraph: {
            rich_text: [
                {
                    type: "text",
                    text: {
                        content: title,
                        link: {
                            url: link
                        },
                    },
                    annotations: {
                        bold: false,
                        italic: false,
                        strikethrough: false,
                        underline: false,
                        code: false,
                        color: "default",
                    },
                    plain_text: title,
                    href: link,
                },
            ],
            color: "default",
        },
    }
}

function calloutBlock(blockData:any,blockType:string) {
    const format = blockData.format;
    const pageIcon = format && format.page_icon;
    const color = format && format.block_color;
    const type = pageIcon.indexOf('/') === -1 ? 'emoji' : 'external'
    
    const properties = blockData.properties;
    const title = properties && properties.title;
    const rich_text = convertTextList(blockData,title);

    return {
        [blockType]: {
            rich_text,
            icon: {
                type,
                [type]: pageIcon
            },
            color
        },
    }
}

function bookmarkBlock(blockData:any,blockType:string) {
    
    const properties = blockData.properties;
    const title = properties && properties.title && properties.title[0][0];
    const link = properties && properties.link && properties.link[0][0];

    return {
        type:'paragraph',
        paragraph: {
            rich_text: [
                {
                    type: "text",
                    text: {
                        content: title,
                        link: {
                            url: link
                        },
                    },
                    annotations: {
                        bold: false,
                        italic: false,
                        strikethrough: false,
                        underline: false,
                        code: false,
                        color: "default",
                    },
                    plain_text: title,
                    href: link,
                },
            ],
            color: "default",
        },
    }
}

/**
 * 
 * @param blockData 
 * @param blockType 
 * @returns 
 */
function videoBlock(blockData:any,blockType:string) {
    
    const properties = blockData.properties;
    const link = properties && properties.source && properties.source[0][0];
    const title = properties && properties.caption && properties.caption[0][0] || properties && properties.title && properties.title[0][0] || link;
    const type = 'external'

    return {
        [blockType]: {
            caption: [{
                plain_text:title
            }],
            type,
            [type]: {
                url: link
            }
        },
    }
}
function embedBlock(blockData:any,blockType:string) {
    
    const properties = blockData.properties;
    const link = properties && properties.source && properties.source[0][0];
    const title = properties && properties.caption && properties.caption[0][0] || properties && properties.title && properties.title[0][0] || link;

    return {
        type:'paragraph',
        paragraph: {
            rich_text: [
                {
                    type: "text",
                    text: {
                        content: title,
                        link: {
                            url: link
                        },
                    },
                    annotations: {
                        bold: false,
                        italic: false,
                        strikethrough: false,
                        underline: false,
                        code: false,
                        color: "default",
                    },
                    plain_text: title,
                    href: link,
                },
            ],
            color: "default",
        },
    }
}

function externalObjectInstanceBlock(blockData:any,blockType:string) {
    
    const format = blockData.format;
    const link = format && format.original_url;
    const title = link;

    return {
        type:'paragraph',
        paragraph: {
            rich_text: [
                {
                    type: "text",
                    text: {
                        content: title,
                        link: {
                            url: link
                        },
                    },
                    annotations: {
                        bold: false,
                        italic: false,
                        strikethrough: false,
                        underline: false,
                        code: false,
                        color: "default",
                    },
                    plain_text: title,
                    href: link,
                },
            ],
            color: "default",
        },
    }
}

function collectionViewPageBlock(blockData:any,blockType:string) {
    const id = blockData.id || '';
    const link = idToAliasLink(id)
    const title = 'collection_view_page'
    return {
        type:'paragraph',
        paragraph: {
            rich_text: [
                {
                    type: "text",
                    text: {
                        content: title,
                        link: {
                            url: link
                        },
                    },
                    annotations: {
                        bold: false,
                        italic: false,
                        strikethrough: false,
                        underline: false,
                        code: false,
                        color: "default",
                    },
                    plain_text: title,
                    href: link,
                },
            ],
            color: "default",
        },
    }
}

function equationBlock(blockData:any,blockType:string) {
    const properties = blockData.properties;
    const title = properties.title && properties.title[0][0] || '';
    return {
        [blockType]:{
            expression:title
        }
    }
}
function blankBlock(blockData:any,blockType:string) {
    const title = '';
    return {
        [blockType]: {
            rich_text: [
                {
                    type: "text",
                    text: {
                        content: title,
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
                    plain_text: title,
                    href: null,
                },
            ],
            color: "default",
        },
    }
}

function defaultBlock(blockType:string) {
    const title = `[${blockType} unsupported]`
    return {
        [blockType]: {
            rich_text: [
                {
                    type: "text",
                    text: {
                        content: title,
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
                    plain_text: title,
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

export function covertToID(str:string) {
    return str.replace(/-/g,'')
}

/**
 * child page title to url
 * @param title 
 * @returns 
 */
export function titleToUrlPath(title:string) {
    // 将非字母数字字符和下划线替换为空格
    const sanitizedTitle = title.replace(/[^a-zA-Z0-9_]+/g, ' ');
    
    // 将多个连续空格替换为单个空格
    const trimmedTitle = sanitizedTitle.replace(/\s+/g, ' ').trim();
    
    // 将空格替换为连字符
    const url = trimmedTitle.replace(/\s+/g, '-');
    
    return url;
  }

  export function titleToUrl(title:string,id:string) {
    let origin = '';
    if(globalThis.location && globalThis.location.origin){
        origin = location.origin;
    }

    const url = origin +'/'+ titleToUrlPath(title) + '-' + covertToID(id)
    
    return url
  }

  export function idToAliasLink(id:string) {
    return 'https://www.notion.so/' + covertToID(id);
  }

