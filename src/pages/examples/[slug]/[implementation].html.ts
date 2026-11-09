import type { APIRoute } from "astro";
import { examples } from "../../../examples";

export function getStaticPaths() {
  return Object.entries(examples).flatMap(([slug, pair]) =>
    Object.entries(pair).map(([implementation, html]) => ({
      params: { slug, implementation },
      props: { html },
    })),
  );
}

export const GET: APIRoute = ({ props }) => new Response(props.html, {
  headers: { "content-type": "text/html; charset=utf-8" },
});
