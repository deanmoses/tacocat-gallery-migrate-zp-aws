import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import {
    DynamoDBDocumentClient,
    BatchExecuteStatementCommand,
    ExecuteStatementCommandInput,
} from '@aws-sdk/lib-dynamodb';
import { getParentAndNameFromPath, isValidImagePath } from './galleryPathUtils.js';
import { TaggedItem } from './db_tags.js';
import { logMajor, logMinor } from './printUtils.js';

/** Update DynamoDB in batches */
export async function updateAwsTags(taggedItems: TaggedItem[]): Promise<void> {
    const ddbClient = new DynamoDBClient({});
    const docClient = DynamoDBDocumentClient.from(ddbClient);
    const alreadyProcessed = 6719;
    const batchSize = 24;
    for (let i = alreadyProcessed; i < taggedItems.length; i += batchSize) {
        const batchEnd = Math.min(i + batchSize, taggedItems.length);
        //logMinor(`Processing ${i} to ${batchEnd}`);
        const batch = taggedItems.slice(i, batchEnd);
        const ddbCommand = new BatchExecuteStatementCommand({
            Statements: batch.map((item) => partiQl(item)),
        });
        //console.log(`command: `, ddbCommand.input.Statements);
        const results = await docClient.send(ddbCommand);
        //console.log(`results: `, JSON.stringify(results.Responses, null, 2));
        results.Responses?.forEach((response) => {
            if (response.Error) throw new Error(`Error processing ${i} to ${batchEnd}: ${response.Error.Message}`);
        });
        logMinor(`Processed ${i} to ${batchEnd}`);
    }
    logMajor(`Processed ${taggedItems.length} items`);
}

/** Build update statement for a single item */
function partiQl(item: TaggedItem): ExecuteStatementCommandInput {
    if (!isValidImagePath(item.path)) throw new Error(`Invalid path [${item.path}]`);
    const pathParts = getParentAndNameFromPath(item.path);
    if (!pathParts.name) throw new Error(`No itemName in path [${item.path}]`);
    return {
        Statement: `UPDATE "tacocat-gallery-sam-prod-items" SET tags=? WHERE parentPath='${pathParts.parent}' AND itemName='${pathParts.name}'`,
        Parameters: [item.tags],
    };
}
