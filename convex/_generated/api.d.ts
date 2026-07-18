/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as artworks from "../artworks.js";
import type * as commerce from "../commerce.js";
import type * as lib_importMerge from "../lib/importMerge.js";
import type * as lib_legacy from "../lib/legacy.js";
import type * as lib_ownerAuth from "../lib/ownerAuth.js";
import type * as lib_serverSecret from "../lib/serverSecret.js";
import type * as migrations from "../migrations.js";
import type * as ownerMutations from "../ownerMutations.js";
import type * as ownerReads from "../ownerReads.js";
import type * as ownerWorkspace from "../ownerWorkspace.js";
import type * as publicWrites from "../publicWrites.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  artworks: typeof artworks;
  commerce: typeof commerce;
  "lib/importMerge": typeof lib_importMerge;
  "lib/legacy": typeof lib_legacy;
  "lib/ownerAuth": typeof lib_ownerAuth;
  "lib/serverSecret": typeof lib_serverSecret;
  migrations: typeof migrations;
  ownerMutations: typeof ownerMutations;
  ownerReads: typeof ownerReads;
  ownerWorkspace: typeof ownerWorkspace;
  publicWrites: typeof publicWrites;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
