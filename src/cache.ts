/**
 * Local persistent cache for GlassHive contact/company ID ↔ metadata mapping.
 *
 * Why: The GlassHive Partner v1 API returns only {Id: ...} for all list and
 * individual GET endpoints — zero searchable fields. This cache is the only
 * way to look up contacts/companies by name or email.
 *
 * Storage: ~/.glasshive-mcp-cache.json
 */

import { readFileSync, writeFileSync, existsSync } from "fs";
import { homedir } from "os";
import { join } from "path";

const CACHE_PATH = join(homedir(), ".glasshive-mcp-cache.json");

export interface CachedContact {
  id: number;
  firstName: string;
  lastName: string;
  email?: string;
  companyId?: number;
  companyName?: string;
}

export interface CachedCompany {
  id: number;
  name: string;
  email?: string;
  website?: string;
}

interface Cache {
  contacts: Record<number, CachedContact>;
  companies: Record<number, CachedCompany>;
}

function load(): Cache {
  if (!existsSync(CACHE_PATH)) {
    return { contacts: {}, companies: {} };
  }
  try {
    return JSON.parse(readFileSync(CACHE_PATH, "utf8")) as Cache;
  } catch {
    return { contacts: {}, companies: {} };
  }
}

function save(cache: Cache): void {
  writeFileSync(CACHE_PATH, JSON.stringify(cache, null, 2), "utf8");
}

export function cacheContact(contact: CachedContact): void {
  const cache = load();
  cache.contacts[contact.id] = contact;
  save(cache);
}

export function cacheCompany(company: CachedCompany): void {
  const cache = load();
  cache.companies[company.id] = company;
  save(cache);
}

export function searchContacts(query: string): CachedContact[] {
  const cache = load();
  const q = query.toLowerCase();
  return Object.values(cache.contacts).filter((c) => {
    const fullName = `${c.firstName} ${c.lastName}`.toLowerCase();
    const email = (c.email ?? "").toLowerCase();
    const company = (c.companyName ?? "").toLowerCase();
    return fullName.includes(q) || email.includes(q) || company.includes(q);
  });
}

export function searchCompanies(query: string): CachedCompany[] {
  const cache = load();
  const q = query.toLowerCase();
  return Object.values(cache.companies).filter((c) => {
    const name = c.name.toLowerCase();
    const email = (c.email ?? "").toLowerCase();
    const website = (c.website ?? "").toLowerCase();
    return name.includes(q) || email.includes(q) || website.includes(q);
  });
}

export function getCacheStats(): { contacts: number; companies: number } {
  const cache = load();
  return {
    contacts: Object.keys(cache.contacts).length,
    companies: Object.keys(cache.companies).length,
  };
}
