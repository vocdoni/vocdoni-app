"use strict";
import { HttpsProxyAgent } from 'https-proxy-agent';
import fetch from 'node-fetch';
import { processEnvSchema, compositionIndexSchema, compositionFileSchema } from './schema.js';

const env = processEnvSchema.parse(process.env);
const agent = env.HTTPS_PROXY ? new HttpsProxyAgent(env.HTTPS_PROXY) : void 0;
async function fetchCompositions() {
  const res = await fetch(`${env.REGISTRY_URL}/compositions/index.json`, {
    agent
  });
  const json = await res.json();
  return compositionIndexSchema.parse(json);
}
async function fetchComposition(id) {
  try {
    const res = await fetch(`${env.REGISTRY_URL}/compositions/${id}.json`, {
      agent
    });
    const json = await res.json();
    return compositionFileSchema.parse(json);
  } catch (error) {
    throw new Error(
      `Failed to fetch snippet "${id}". Make sure the id is correct or run @chakra-ui/cli snippet list to see available snippets.`
    );
  }
}
async function fetchProBlocks() {
  const res = await fetch("https://pro.chakra-ui.com/api/blocks", {
    agent
  });
  if (!res.ok) {
    throw new Error(
      `Failed to fetch pro blocks: ${res.status} ${res.statusText}`
    );
  }
  return res.json();
}
async function fetchProBlock(category, id, apiKey) {
  const res = await fetch(
    `https://pro.chakra-ui.com/api/blocks/${category}/${id}`,
    {
      agent,
      headers: {
        "x-api-key": apiKey
      }
    }
  );
  if (!res.ok) {
    throw new Error(
      `Failed to fetch pro block ${category}/${id}: ${res.status} ${res.statusText}`
    );
  }
  return res.json();
}

export { fetchComposition, fetchCompositions, fetchProBlock, fetchProBlocks };
