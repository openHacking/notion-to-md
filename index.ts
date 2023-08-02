const { Client } = require("@notionhq/client");
const { NotionToMarkdown } = require("./src/notion-to-md");
const {convertBlocksResponseData} = require("./src/utils/transform")
const fs = require('fs');
require('dotenv').config()
const auth = process.env.NOTION_CLIENT_TOKEN;

const notionClient = new Client({
  auth
});
const originData = {
  "51eb3724-1554-4cad-8f42-a2103a7feafa": {
      "value": {
          "value": {
              "id": "51eb3724-1554-4cad-8f42-a2103a7feafa",
              "version": 29,
              "type": "page",
              "properties": {
                  "title": [
                      [
                          "marked"
                      ]
                  ]
              },
              "content": [
                  "68fb57bb-a09c-4691-82a9-6ebdb6c427c7",
                  "4ef0cca0-8bfd-4a1f-aa18-86410101b323",
                  "7562c643-bfc1-4a47-9846-608f691a939c",
                  "06a6714d-bc73-40d4-b0f8-b926f4bcad1b"
              ],
              "permissions": [
                  {
                      "role": "reader",
                      "type": "public_permission",
                      "added_timestamp": 1690796398163,
                      "allow_duplicate": false
                  },
                  {
                      "role": {
                          "read_content": true,
                          "insert_content": true,
                          "update_content": true
                      },
                      "type": "bot_permission",
                      "bot_id": "859cfd19-17b1-4f7a-b4d3-f1092fdaa49a",
                      "parent_id": "f0fd961b-4c47-4b78-90d0-ff28a559d0d0",
                      "parent_table": "space"
                  }
              ],
              "created_time": 1690796284353,
              "last_edited_time": 1690796416214,
              "parent_id": "454a6e7b-7009-469e-bfae-cf19fdf5234d",
              "parent_table": "block",
              "alive": true,
              "created_by_table": "notion_user",
              "created_by_id": "7ede56ff-3f6c-49d6-b011-fcba930cc347",
              "last_edited_by_table": "notion_user",
              "last_edited_by_id": "7ede56ff-3f6c-49d6-b011-fcba930cc347",
              "space_id": "f0fd961b-4c47-4b78-90d0-ff28a559d0d0"
          },
          "role": "reader"
      }
  },
  "68fb57bb-a09c-4691-82a9-6ebdb6c427c7": {
      "value": {
          "value": {
              "id": "68fb57bb-a09c-4691-82a9-6ebdb6c427c7",
              "version": 122,
              "type": "text",
              "properties": {
                  "title": [
                      [
                          "I use this marked"
                      ]
                  ]
              },
              "created_time": 1690796327732,
              "last_edited_time": 1690796377022,
              "parent_id": "51eb3724-1554-4cad-8f42-a2103a7feafa",
              "parent_table": "block",
              "alive": true,
              "created_by_table": "notion_user",
              "created_by_id": "7ede56ff-3f6c-49d6-b011-fcba930cc347",
              "last_edited_by_table": "notion_user",
              "last_edited_by_id": "7ede56ff-3f6c-49d6-b011-fcba930cc347",
              "space_id": "f0fd961b-4c47-4b78-90d0-ff28a559d0d0"
          },
          "role": "reader"
      }
  },
  "4ef0cca0-8bfd-4a1f-aa18-86410101b323": {
      "value": {
          "value": {
              "id": "4ef0cca0-8bfd-4a1f-aa18-86410101b323",
              "version": 22,
              "type": "bulleted_list",
              "properties": {
                  "title": [
                      [
                          "first"
                      ]
                  ]
              },
              "created_time": 1690796380068,
              "last_edited_time": 1690796382432,
              "parent_id": "51eb3724-1554-4cad-8f42-a2103a7feafa",
              "parent_table": "block",
              "alive": true,
              "created_by_table": "notion_user",
              "created_by_id": "7ede56ff-3f6c-49d6-b011-fcba930cc347",
              "last_edited_by_table": "notion_user",
              "last_edited_by_id": "7ede56ff-3f6c-49d6-b011-fcba930cc347",
              "space_id": "f0fd961b-4c47-4b78-90d0-ff28a559d0d0"
          },
          "role": "reader"
      }
  },
  "7562c643-bfc1-4a47-9846-608f691a939c": {
      "value": {
          "value": {
              "id": "7562c643-bfc1-4a47-9846-608f691a939c",
              "version": 17,
              "type": "bulleted_list",
              "properties": {
                  "title": [
                      [
                          "second"
                      ]
                  ]
              },
              "created_time": 1690796382807,
              "last_edited_time": 1690796384635,
              "parent_id": "51eb3724-1554-4cad-8f42-a2103a7feafa",
              "parent_table": "block",
              "alive": true,
              "created_by_table": "notion_user",
              "created_by_id": "7ede56ff-3f6c-49d6-b011-fcba930cc347",
              "last_edited_by_table": "notion_user",
              "last_edited_by_id": "7ede56ff-3f6c-49d6-b011-fcba930cc347",
              "space_id": "f0fd961b-4c47-4b78-90d0-ff28a559d0d0"
          },
          "role": "reader"
      }
  },
  "06a6714d-bc73-40d4-b0f8-b926f4bcad1b": {
      "value": {
          "value": {
              "id": "06a6714d-bc73-40d4-b0f8-b926f4bcad1b",
              "version": 15,
              "type": "bulleted_list",
              "properties": {
                  "title": [
                      [
                          "third"
                      ]
                  ]
              },
              "created_time": 1690796387103,
              "last_edited_time": 1690796389458,
              "parent_id": "51eb3724-1554-4cad-8f42-a2103a7feafa",
              "parent_table": "block",
              "alive": true,
              "created_by_table": "notion_user",
              "created_by_id": "7ede56ff-3f6c-49d6-b011-fcba930cc347",
              "last_edited_by_table": "notion_user",
              "last_edited_by_id": "7ede56ff-3f6c-49d6-b011-fcba930cc347",
              "space_id": "f0fd961b-4c47-4b78-90d0-ff28a559d0d0"
          },
          "role": "reader"
      }
  }
}

const blocks = [
  {
      "object": "block",
      "id": "68fb57bb-a09c-4691-82a9-6ebdb6c427c7",
      "parent": {
          "type": "page_id",
          "page_id": "51eb3724-1554-4cad-8f42-a2103a7feafa"
      },
      "created_time": "2023-07-31T09:38:00.000Z",
      "last_edited_time": "2023-07-31T09:39:00.000Z",
      "created_by": {
          "object": "user",
          "id": "7ede56ff-3f6c-49d6-b011-fcba930cc347"
      },
      "last_edited_by": {
          "object": "user",
          "id": "7ede56ff-3f6c-49d6-b011-fcba930cc347"
      },
      "has_children": false,
      "archived": false,
      "type": "paragraph",
      "paragraph": {
          "rich_text": [
              {
                  "type": "text",
                  "text": {
                      "content": "I use this marked",
                      "link": null
                  },
                  "annotations": {
                      "bold": false,
                      "italic": false,
                      "strikethrough": false,
                      "underline": false,
                      "code": false,
                      "color": "default"
                  },
                  "plain_text": "I use this marked",
                  "href": null
              }
          ],
          "color": "default"
      }
  },
  {
      "object": "block",
      "id": "4ef0cca0-8bfd-4a1f-aa18-86410101b323",
      "parent": {
          "type": "page_id",
          "page_id": "51eb3724-1554-4cad-8f42-a2103a7feafa"
      },
      "created_time": "2023-07-31T09:39:00.000Z",
      "last_edited_time": "2023-07-31T09:39:00.000Z",
      "created_by": {
          "object": "user",
          "id": "7ede56ff-3f6c-49d6-b011-fcba930cc347"
      },
      "last_edited_by": {
          "object": "user",
          "id": "7ede56ff-3f6c-49d6-b011-fcba930cc347"
      },
      "has_children": false,
      "archived": false,
      "type": "bulleted_list_item",
      "bulleted_list_item": {
          "rich_text": [
              {
                  "type": "text",
                  "text": {
                      "content": "first",
                      "link": null
                  },
                  "annotations": {
                      "bold": false,
                      "italic": false,
                      "strikethrough": false,
                      "underline": false,
                      "code": false,
                      "color": "default"
                  },
                  "plain_text": "first",
                  "href": null
              }
          ],
          "color": "default"
      }
  },
  {
      "object": "block",
      "id": "7562c643-bfc1-4a47-9846-608f691a939c",
      "parent": {
          "type": "page_id",
          "page_id": "51eb3724-1554-4cad-8f42-a2103a7feafa"
      },
      "created_time": "2023-07-31T09:39:00.000Z",
      "last_edited_time": "2023-07-31T09:39:00.000Z",
      "created_by": {
          "object": "user",
          "id": "7ede56ff-3f6c-49d6-b011-fcba930cc347"
      },
      "last_edited_by": {
          "object": "user",
          "id": "7ede56ff-3f6c-49d6-b011-fcba930cc347"
      },
      "has_children": false,
      "archived": false,
      "type": "bulleted_list_item",
      "bulleted_list_item": {
          "rich_text": [
              {
                  "type": "text",
                  "text": {
                      "content": "second",
                      "link": null
                  },
                  "annotations": {
                      "bold": false,
                      "italic": false,
                      "strikethrough": false,
                      "underline": false,
                      "code": false,
                      "color": "default"
                  },
                  "plain_text": "second",
                  "href": null
              }
          ],
          "color": "default"
      }
  },
  {
      "object": "block",
      "id": "06a6714d-bc73-40d4-b0f8-b926f4bcad1b",
      "parent": {
          "type": "page_id",
          "page_id": "51eb3724-1554-4cad-8f42-a2103a7feafa"
      },
      "created_time": "2023-07-31T09:39:00.000Z",
      "last_edited_time": "2023-07-31T09:39:00.000Z",
      "created_by": {
          "object": "user",
          "id": "7ede56ff-3f6c-49d6-b011-fcba930cc347"
      },
      "last_edited_by": {
          "object": "user",
          "id": "7ede56ff-3f6c-49d6-b011-fcba930cc347"
      },
      "has_children": false,
      "archived": false,
      "type": "bulleted_list_item",
      "bulleted_list_item": {
          "rich_text": [
              {
                  "type": "text",
                  "text": {
                      "content": "third",
                      "link": null
                  },
                  "annotations": {
                      "bold": false,
                      "italic": false,
                      "strikethrough": false,
                      "underline": false,
                      "code": false,
                      "color": "default"
                  },
                  "plain_text": "third",
                  "href": null
              }
          ],
          "color": "default"
      }
  }
]

const pageId = '51eb3724-1554-4cad-8f42-a2103a7feafa'
const responseData = convertBlocksResponseData(originData, pageId);

// passing notion client to the option
const n2m = new NotionToMarkdown({ notionClient, config:{
  blocks:responseData
} });

(async () => {
  const mdblocks = await n2m.pageToMarkdown("51eb372415544cad8f42a2103a7feafa");
  const mdString = n2m.toMarkdownString(mdblocks);
  // console.log('trans====',mdString.parent);
})();