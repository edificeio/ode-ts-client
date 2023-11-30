import { IResource } from "..";

/**
 * Parameters expected to create resource
 */
export interface CreateParameters {
  name: string;
  description: string;
  thumbnail: string | Blob | File;
  folder: number | undefined;

  public?: boolean;
  slug?: string;
  commentType?: string;
  publishType?: string;
  app?: string;
}

/**
 * Parameters expected to update resource
 */
export interface UpdateParameters {
  entId: string;
  trashed: boolean;
  name: string;
  thumbnail: string | Blob | File;
  description: string;
  public: boolean;
  slug: string;
}

/**
 * Response when creating resource
 */
export interface CreateResult {
  entId: string;
  thumbnail: string | undefined;
  
  _id?: string;
  title?: string;
  description?: string;
  visibility?: string;
  trashed?: boolean;
  "publish-type"?: string;
  "comment-type"?: string;
  created?: { "$date": string };
  modified?: { "$date": string };
  author?: { userId: string, username: string, login: string };
  shared?: Array<string>;
}

/**
 * Response when updating resource
 */
export interface UpdateResult {
  entId: string;
  thumbnail?: string;
}

export interface BlogUpdate extends UpdateParameters {
  "publish-type"?: "RESTRAINT" | "IMMEDIATE";
}

export interface BlogResource extends IResource {
  "publish-type": "RESTRAINT" | "IMMEDIATE";
}

export interface MindmapUpdate extends UpdateParameters {
  "publish-type"?: "RESTRAINT" | "IMMEDIATE";
}

export interface MindmapResource extends IResource {
  "publish-type": "RESTRAINT" | "IMMEDIATE";
}
