const { Client } = require("@notionhq/client");
const { NotionToMarkdown } = require("./src/notion-to-md");
const fs = require('fs');
require('dotenv').config()
const auth = process.env.NOTION_CLIENT_TOKEN;

const notionClient = new Client({
  auth
});

// passing notion client to the option
const n2m = new NotionToMarkdown({ notionClient });

(async () => {
  const mdblocks = await n2m.pageToMarkdown("51eb372415544cad8f42a2103a7feafa");
  const mdString = n2m.toMarkdownString(mdblocks);
  // console.log(mdString.parent);
})();