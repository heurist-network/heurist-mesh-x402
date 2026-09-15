<!-- source: https://www.offeringprotocol.org/documentation/guides/collections/ -->
<!-- fetched: 2026-09-15 -->

Docs Menu

Guides

# Organize a catalog with Collections

Create useful browse paths through a catalog without making Collections a requirement or forcing every Service into one taxonomy.

### Use Collections for optional navigation

Collections group Offerings into browsable parts of a catalog. A Service can publish Offering search without Collections, publish a flat set of Collections without hierarchy, or combine both capabilities.

Use a Collection

### Create a meaningful browse path

Group Offerings when the relationship helps an Agent narrow, explore, or understand the catalog.

Omit Collections

### Expose Offerings directly

A Service with a small or straightforward catalog may not need Collections. Agents can browse every Offering through list-offerings and locate matching Offerings through search-offerings.

### Model navigation as one graph

Collections describe navigation relationships, not a required storage model. One catalog graph can contain root Collections, single-parent branches, and Collections that appear beneath multiple parents. Use only the relationships that create useful browse paths.

- [Root Collections](#catalog-shape): omit parent\_ids and provide the starting points for browsing the catalog
- [Single-parent branches](#catalog-shape): name one direct parent when a Collection belongs in one broader path
- [Multiple-parent branches](#catalog-shape): name more than one direct parent when the same Collection belongs naturally in several browse paths

A Service can change its navigation design without changing the meaning or identity of the Offerings being organized. Collection membership and Collection hierarchy remain separate relationships.

### Describe a Collection

A Full Collection contains odp\_version, id, and name. Optional fields add description, imagery, language, browser navigation, hierarchy, and Collection-scoped search capabilities.

12345678910111213141516

```
{
  "odp_version": "1.0",
  "id": "research-tools",
  "name": "Research tools",
  "description": "Tools for finding and analyzing information.",
  "images": [
    {
      "src": "/images/collections/research-tools.png",
      "alt": "Research tools"
    }
  ],
  "parent_ids": [
    "developer-tools"
  ],
  "web_url": "/collections/research-tools"
}
```

A list or search response can return a terse form containing only id, name, and other useful summary fields. Retrieve the Collection individually when its full metadata is needed.

The first image is the primary image, and web\_url identifies an optional human-facing browser experience. Neither field changes the Collection's ODP identity.

### Model hierarchy as a graph

parent\_ids contains the direct parents of a Collection. Omitting it identifies a root Collection. Multiple roots and multiple parents are valid, so Agents treat the hierarchy as a directed acyclic graph rather than assuming one tree.

123456789101112131415161718192021

```
{
  "odp_version": "1.0",
  "items": [
    {
      "id": "business-tools",
      "name": "Business tools"
    },
    {
      "id": "developer-tools",
      "name": "Developer tools"
    },
    {
      "id": "research-tools",
      "name": "Research tools",
      "parent_ids": [
        "business-tools",
        "developer-tools"
      ]
    }
  ]
}
```

In this example, business-tools and developer-tools are roots. research-tools appears beneath both browse paths while remaining one Collection with one Resource Identity.

- [Roots](#hierarchy): omit parent\_ids; do not serialize an empty array
- [Parents](#hierarchy): publish only direct parent identifiers that resolve under the same access context
- [Children](#search-hierarchy): discover direct children through Collection search because ODP has no child\_ids field
- [Depth](#hierarchy): keep every path through successive parents within 32 edges

Keep unrelated catalog data usable

An Agent ignores an edge that creates a cycle, exceeds the depth limit, names the current Collection, or names a missing Collection. That edge does not invalidate unrelated Collections, Offering memberships, or operations.

### Connect Offerings through direct membership

An Offering's collection\_ids lists the Collections in which it is a direct member. An Offering can belong to no Collection, one Collection, or several Collections.

The list-collection-offerings operation must return the Offerings that directly name the Collection in collection\_ids for the same authentication context. Membership in a child Collection does not imply membership in its ancestors.

An Agent ignores an unresolved membership identifier without discarding the Offering or its other memberships. See [Offerings](https://www.offeringprotocol.org/documentation/guides/offerings/) for the rest of the Offering representation.

### Choose the Collection operation

| Goal | Operation | Result |
| --- | --- | --- |
| Traverse Collections | list-collections | The complete accessible Collection sequence without a search constraint. |
| Retrieve one Collection | get-collection | The Collection identified by its local resource identifier. |
| Find Collections | search-collections | Collections matching text, a hierarchy constraint, or both. |
| Browse direct members | list-collection-offerings | Offerings whose collection\_ids contains the named Collection. |
| Traverse all Offerings | list-offerings | Every accessible Offering without inventing an all-Offerings Collection. |

### Search text and hierarchy

Collection search requires query, parent\_id, or both. A JSON null parent selects root Collections; an identifier selects its direct children. Omitting parent\_id applies no hierarchy constraint.

12345

```
{
  "odp_version": "1.0",
  "query": "research",
  "parent_id": "developer-tools"
}
```

The example returns direct children of developer-tools that also match the Service-interpreted text query. ODP does not standardize text matching, tokenization, case folding, or relevance.

01

### Find the roots

Search with parent\_id set to JSON null to obtain Collections that do not name a parent.

02

### Follow one level

Search with a Collection ID to obtain only its direct children, not every descendant.

03

### Track visited Collections

Process a Collection once even when multiple parent paths lead to it, and ignore an invalid edge without abandoning the traversal.

ODP 1.0 does not define client-selected Collection sorting. The Service chooses a stable sequence, and the Agent preserves it unless its own caller explicitly requests local presentation ordering.

### Use List Offerings for the complete catalog

Use list-offerings to retrieve the complete accessible Offering sequence. ODP does not require an artificial Collection containing every Offering, although a Service can publish a similar Collection when it has a real business meaning.

### Keep navigation stable and recognizable

Collection IDs participate in links, hierarchy, membership, and pagination. Keep an ID stable when a display name or description changes, and do not derive client behavior from presentation text.

- [Stable ID](#stable-navigation): retain the same local identifier while the Collection represents the same navigation resource
- [Useful names](#collection-representation): choose names that make sense when displayed without their parents
- [Explanatory descriptions](#collection-representation): state what belongs in the Collection rather than repeating its name
- [Recognizable imagery](https://www.offeringprotocol.org/documentation/guides/branding-and-localization/): provide a primary image when visual navigation materially helps the catalog

### Next steps

Catalog resources

### Describe individual Offerings

Define the resources that an Agent evaluates, retrieves, and acts upon.

[Offerings](https://www.offeringprotocol.org/documentation/guides/offerings/)

Catalog queries

### Construct constrained searches

Use text, advertised filters, sort recipes, and refinements correctly.

[Search and filtering](https://www.offeringprotocol.org/documentation/guides/search-and-filtering/)

On this page

- [Use Collections for optional navigation](#optional-navigation)
- [Model navigation as one graph](#catalog-shape)
- [Describe a Collection](#collection-representation)
- [Model hierarchy as a graph](#hierarchy)
- [Connect Offerings through direct membership](#offering-membership)
- [Choose the Collection operation](#choose-operation)
- [Search text and hierarchy](#search-hierarchy)
- [Use List Offerings for the complete catalog](#no-synthetic-collection)
- [Keep navigation stable and recognizable](#stable-navigation)
- [Next steps](#next-steps)

[Authored byInFlow[A]](https://www.inflowpay.ai/)
