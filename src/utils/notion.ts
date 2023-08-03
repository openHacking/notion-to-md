import { Client } from "@notionhq/client";
import { ListBlockChildrenResponse } from "@notionhq/client/build/src/api-endpoints";
import { ListBlockChildrenResponseResults } from "../types";
import { convertBlocksResponseData, convertToUUID } from "./transform";

export const getBlockChildren = async (
  notionClient: Client,
  block_id: string,
  totalPage: number | null,
  blocks:any
) => {
  let result: ListBlockChildrenResponseResults = [];
  let pageCount = 0;
  let start_cursor = undefined;

  if(notionClient as unknown as string === 'local'){

    if(block_id.indexOf('-') === -1){
      block_id = convertToUUID(block_id)
    }
    
    result = convertBlocksResponseData(blocks, block_id) as ListBlockChildrenResponseResults;

    // console.info('\n\n\n\n\n\nchild===local=====result========================\n\n\n',JSON.stringify(result))

  }else{
    do {
      const response = (await notionClient.blocks.children.list({
        start_cursor: start_cursor,
        block_id: block_id,
      })) as ListBlockChildrenResponse;
      result.push(...response.results);
  
      start_cursor = response?.next_cursor;
      pageCount += 1;
    } while (
      start_cursor != null &&
      (totalPage == null || pageCount < totalPage)
    );
  }

  modifyNumberedListObject(result);
  return result;
};

export const modifyNumberedListObject = (
  blocks: ListBlockChildrenResponseResults
) => {
  let numberedListIndex = 0;

  for (const block of blocks) {
    if ("type" in block && block.type === "numbered_list_item") {
      // add numbers
      // @ts-ignore
      block.numbered_list_item.number = ++numberedListIndex;
    } else {
      numberedListIndex = 0;
    }
  }
};
