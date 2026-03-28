Architecture: Each source SVG is parsed and normalized by its viewBox, then mounted into a composed <svg> workspace where every glyph is wrapped in a metadata-rich <g> node for exact reconstruction.

Transforms: Rotation, mirroring, and scaling are applied mathematically via the SVG transform attribute around each glyph's geometric center, ensuring all edits remain resolution-independent.

Clipboard Engine: The copy function writes text/html, image/svg+xml, and text/plain simultaneously, allowing Office apps to recognize and paste the content as a sharp, scalable vector.

Reconstruction Logic: The paste handler prioritizes rebuilding items from data-glyph-code and serialized transform metadata, falling back to plain text IDs when rich formats are unavailable.

Engineering Priorities: The system is designed to prevent rasterization at every stage, ensuring that the final output remains vector-sharp under any zoom level or external application export.
