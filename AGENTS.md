# Project Visual Identity & Design System

The following prompt defines the exact design style to be maintained throughout this project. When creating new views, components, or making UI edits, adhere strictly to these principles:

## Core Design Prompt
"Build a web application using React and Tailwind CSS, adhering to this specific visual identity and design system:

- **Color Palette**: Use Tailwind's slate palette for neutrals (`bg-slate-50` to `bg-slate-100` for app backgrounds, `bg-white` for cards). Text should be `text-slate-900` for high contrast and `text-slate-400` for secondary context. Use **cyan** as the core primary brand color (e.g., `bg-cyan-50`, `text-cyan-700`, `border-cyan-100` for accents). Use `emerald-600` for positive/success indicators.
- **Typography**: Import and use the **'Inter'** font family for everything.
- **Micro-Typography (Crucial)**: For section labels, metadata, and secondary buttons, use tiny, heavily tracked uppercase text (e.g., `text-[10px] font-black uppercase tracking-widest text-slate-400`).
- **Heading Typography**: For primary titles and numbers, use heavy, tightly spaced fonts (e.g., `text-xl font-black text-slate-900 tracking-tight`).
- **Shapes & Radii**: Avoid sharp corners altogether. Cards should be heavily rounded (using standard Tailwind `rounded-3xl` or custom `rounded-[2.5rem]`). Inner blocks and buttons should use `rounded-2xl` or `rounded-xl`.
- **Depth & Borders**: Do not use heavy borders. Use very subtle outlines (`border border-slate-100` or `border-cyan-100`) paired with soft shadows (`shadow-sm` or `shadow-md`) on pure white backgrounds.
- **Decorative Accents**: Add subtle, abstract geometric shapes inside larger cards for visual interest (for example, an absolute positioned overlay like `w-64 h-64 bg-cyan-50 rounded-bl-full opacity-50`).
- **Interactions**: Buttons and interactive elements should feel tactile with smooth scaling (e.g., `transition-all active:scale-95 hover:bg-cyan-100`)."

## Why it works
- **The "Micro-typography"**: Combining `text-[10px]`, `font-black`, and `tracking-widest` makes labels look incredibly elegant and professional rather than cluttered.
- **The Slate + Cyan combo**: Slate is a "cool" grey which pairs beautifully with cyan, giving off a clinical, technological, yet friendly vibe.
- **Hyper-rounded corners (`rounded-[2.5rem]`)**: This makes the interface feel modern, approachable, and hardware-like (similar to modern mobile operating systems).
