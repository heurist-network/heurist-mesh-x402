<!-- source: https://www.offeringprotocol.org/documentation/guides/branding-and-localization/ -->
<!-- fetched: 2026-09-15 -->

Docs Menu

Guides

# Present a recognizable Service

Use Service branding, catalog imagery, and localized representations to help Agents present Services and catalog resources clearly to people.

### Separate Service branding, resource images, and language

ODP provides distinct presentation fields because a Service mark, an Offering image, and translated metadata answer different questions. Keeping those concerns separate lets an Agent select the correct visual and language without interpreting filenames or presentation text.

- [Branding](#service-branding): a square icon and horizontal logo identify the Service across directories, applications, and compact interfaces
- [Resource images](#resource-images): ordered images depict a particular Collection or Offering rather than the Service as a whole
- [Localization](#language-metadata): language metadata and HTTP negotiation identify which translated representation an Agent received

### Publish both Service marks

branding is optional, but when present it contains both icon and logo. Each mark requires a Resource Reference in src and can include a type hint.

123456789101112

```
{
  "branding": {
    "icon": {
      "src": "/images/icon.svg",
      "type": "image/svg+xml"
    },
    "logo": {
      "src": "/images/logo.svg",
      "type": "image/svg+xml"
    }
  }
}
```

| Mark | Presentation | Recommended size |
| --- | --- | --- |
| icon | A compact Service mark for a square canvas. | 200 by 200 pixels |
| logo | A wider Service mark for a horizontal 4:1 canvas. | 400 by 100 pixels |

Branding supports PNG, WebP, and SVG. The optional type is a pre-retrieval hint and is especially useful when the URL does not reveal the format. The successful response remains authoritative and must match an advertised type.

### Preserve the original artwork

A client that normalizes branding fits and centers the source within the appropriate canvas. It preserves the aspect ratio and never crops or stretches the artwork merely to fill the target dimensions.

01

### Choose the canvas

Use a square canvas for the icon and a horizontal 4:1 canvas for the logo.

02

### Fit and center

Scale the source proportionally until it fits, then center it without cropping or distortion.

03

### Fill unused space

Keep unused canvas pixels transparent whenever the normalized format supports transparency.

Services provide enough source resolution to avoid upscaling. An SVG source must provide positive intrinsic dimensions or positive view-box dimensions so a client can determine its aspect ratio.

### Add images to Collections and Offerings

A Collection or Offering can include images, an ordered array containing one to 16 image descriptors. These images depict the catalog resource; they do not replace the Service icon or logo.

123456789101112131415161718

```
{
  "images": [
    {
      "src": "/images/offerings/web-search.webp",
      "alt": "Search results displayed in a research workspace",
      "width": 1200,
      "height": 800,
      "type": "image/webp"
    },
    {
      "src": "https://cdn.example.com/images/source-details.jpg",
      "alt": "Source details with citations",
      "width": 1200,
      "height": 800,
      "type": "image/jpeg"
    }
  ]
}
```

| Field | Requirement | Meaning |
| --- | --- | --- |
| src | Required | An origin-relative or absolute HTTPS Resource Reference. Values cannot repeat within one array. |
| alt | Optional | Non-empty alternative text of no more than 1,024 Unicode code points in the language of the containing representation. |
| width and height | Optional | Positive intrinsic dimensions in CSS pixels, each no greater than 65,535. |
| type | Optional | A pre-retrieval AVIF, JPEG, PNG, SVG, or WebP media-type hint. |

When type is omitted, an Agent determines the image format from the response Content-Type. A filename extension can help a publisher choose whether to advertise a hint, but it is not authoritative.

### Put the primary image first

The first descriptor identifies the primary image. Choose the image that can represent the Collection or Offering when an Agent has room to display only one visual.

A Terse Representation can include only that primary image even when the Full Representation contains more. The descriptor itself remains complete; a Service does not partially serialize its fields to make a smaller summary.

Omission is not absence

When images is absent from a Terse Representation, an Agent cannot conclude that the Full Representation has no images. Retrieve the individual resource before making that determination.

### Retrieve images without credentials

Branding and resource images are public supporting resources. An Agent never attaches AEP credentials, payment credentials, cookies, or authorization fields copied from another request when retrieving them.

- [Resolve](#image-retrieval): resolve an origin-relative src against the Service origin, not the containing representation path
- [Verify](#image-retrieval): treat the response Content-Type as authoritative and reject a mismatched advertised type
- [Isolate](#image-retrieval): sanitize and safely isolate displayed SVG, or rasterize it before presentation
- [Bound](#image-retrieval): apply redirect, network-address, decoding, rendering, and resource limits to untrusted image content

A branding response is limited to 1,048,576 bytes and five redirects. For Collection and Offering imagery, clients apply their own bounded image policy. An invalid resource image makes only that image unusable; the containing resource remains usable.

### Declare the representation language

Every Service Document requires language and localizations, including a Service published in only one language. language identifies the current representation, while localizations lists the available Service metadata languages and always includes the current language.

1234

```
{
  "language": "en",
  "localizations": ["en", "es", "fr"]
}
```

Both fields use [RFC 5646 language tags](https://www.rfc-editor.org/rfc/rfc5646). The list contains one to 16 unique tags; a single-language Service uses a list such as ["en"]. Service metadata does not promise that every Collection or Offering is available in the same languages.

### Select a localized representation

An Agent expresses language preferences with Accept-Language. A Service with multiple representations applies [RFC 4647 Lookup](https://www.rfc-editor.org/rfc/rfc4647#section-3.4) and returns the best available match.

Agent request

1

```
Accept-Language: fr-CA, fr;q=0.9, en;q=0.7
```

Service response

12

```
Content-Language: fr
Vary: Accept-Language
```

01

### Read the preferences

Evaluate the ordered language ranges and quality values from Accept-Language.

02

### Apply Lookup

Select the closest available language using the standard RFC 4647 procedure.

03

### Identify the result

Return Content-Language and Vary: Accept-Language, with an entity tag distinct from other language variants.

Fall back instead of rejecting

When no requested language matches, the Service returns its default representation rather than 406 Not Acceptable. ODP does not define a language-selection query parameter.

### Inherit language from the nearest context

Collections and Offerings can declare their own language metadata. They omit it when they use the language already established by the containing response or Service Document.

| Priority | Source | Applies when |
| --- | --- | --- |
| 1 | Collection or Offering | The individual resource declares language metadata. |
| 2 | Containing response | The resource omits language metadata and the response establishes it. |
| 3 | Service Document | Neither the resource nor its response declares another language. |

Content-Language identifies the language actually selected for the HTTP representation. It does not change the stable Resource Identity of a Collection or Offering.

### Keep presentation metadata dependable

- [Service branding](#service-branding): publish both marks together and use each in the canvas for which it was designed
- [Resource imagery](#resource-images): put the strongest representative image first and describe meaningful images with localized alternative text
- [Public retrieval](#image-retrieval): resolve each reference independently and keep credentials out of every image request
- [Language variants](#language-selection): negotiate with HTTP headers, return the selected language, and keep cache validators variant-specific

### Next steps

Catalog navigation

### Present useful groupings

Add recognizable images and localized metadata to the browse paths that organize a catalog.

[Collections](https://www.offeringprotocol.org/documentation/guides/collections/)

Catalog resources

### Present individual choices

Describe each discoverable resource with meaningful text, imagery, attributes, pricing, and Actions.

[Offerings](https://www.offeringprotocol.org/documentation/guides/offerings/)

On this page

- [Presentation boundaries](#presentation-boundaries)
- [Service branding](#service-branding)
- [Artwork normalization](#preserve-artwork)
- [Resource images](#resource-images)
- [Primary image](#primary-image)
- [Image retrieval](#image-retrieval)
- [Language metadata](#language-metadata)
- [Language selection](#language-selection)
- [Language inheritance](#language-inheritance)
- [Implementation checklist](#implementation-checklist)
- [Next steps](#next-steps)

[Authored byInFlow[A]](https://www.inflowpay.ai/)
