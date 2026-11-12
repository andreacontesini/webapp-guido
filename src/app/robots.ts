import type { MetadataRoute } from "next";

import { urlLanding } from "@/lib/url";

/** Indicizzazione: solo le pagine pubbliche (pagina iniziale e landing). */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/accesso", "/admin", "/anteprima", "/api/", "/auth/", "/benvenuto", "/dashboard"],
    },
    sitemap: `${urlLanding()}/sitemap.xml`,
  };
}
