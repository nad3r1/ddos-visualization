# Interactive Visualization of DDoS Attacks Across the TCP/IP Model

## Project Overview
This project is a plain HTML, CSS, and JavaScript educational website about DDoS attacks across the TCP/IP model.

The site is now organized as a multi-page experience rather than one very long scrolling page. The simulator remains the central interactive feature, but the supporting educational content has been moved into dedicated pages so the project feels more like a structured learning website.

The project combines short academic explanations with an interactive model so a reviewer can see both conceptual understanding and applied comparison across attack and mitigation pairs.

## How to Run
1. Keep all project files in the same folder.
2. Open `index.html` in a modern web browser.
3. Navigate between pages using the site navigation bar.
4. No server, backend, framework, package manager, or build step is required.

## Files Included
- `index.html`
  Homepage and project overview.
- `simulator.html`
  Main interactive DDoS simulator page.
- `attacks.html`
  Dedicated attack guide page.
- `mitigations.html`
  Dedicated mitigation guide page.
- `tcpip.html`
  TCP/IP model explanation page.
- `walkthroughs.html`
  Guided scenario walkthrough page.
- `glossary.html`
  Glossary and references page.
- `styles.css`
  Shared styling for all pages.
- `data.js`
  Structured educational content and simulator data.
- `script.js`
  Shared page-aware JavaScript for simulator logic and guide rendering.

## Page Structure and Purpose
### `index.html`
- Introduces the project
- Explains DDoS attacks at a high level
- Emphasizes availability as the main security property under attack
- Lists learning objectives, research basis, and real-world relevance
- Gives quick calls to action for the simulator and guide pages

### `simulator.html`
- Hosts the main interactive simulator
- Lets users choose attacks, mitigations, comparisons, and preset scenarios
- Displays recommendations, metric bars, TCP/IP layer impact, interpretation, comparison output, saved history, and simulator limitations

### `attacks.html`
- Contains dedicated written sections for:
  - SYN Flood
  - HTTP Flood
  - UDP Flood
  - DNS Amplification

### `mitigations.html`
- Contains dedicated written sections for:
  - Rate Limiting
  - SYN Cookies
  - Traffic Filtering
  - Load Balancing
  - CDN / Anycast Absorption

### `tcpip.html`
- Explains the TCP/IP model
- Maps attacks to layers, protocols, and security relevance

### `walkthroughs.html`
- Provides guided simulator scenarios
- Explains what users should select and what they should notice

### `glossary.html`
- Includes glossary terms
- Includes clickable references used in the project
- Notes that the simulator uses simplified educational metrics

## Major Features
- Multi-page navigation
- Dark, modern educational site layout
- Interactive DDoS simulator
- Dedicated attack guides
- Dedicated mitigation guides
- TCP/IP model mapping page
- Guided walkthrough scenarios
- Glossary and references page
- Relative links that work when opening files locally
- Query-parameter shortcuts for opening selected simulator scenarios

## Simulator Assumptions
The simulator is intentionally simplified for education.

Primary metrics shown in the simulator:
- `Server Load`
- `Legitimate Traffic Served`
- `Attack Pressure Reduced`
- `Service Availability`

- Metric values are illustrative rather than real traffic measurements.
- The same attack and mitigation combination produces the same result each time.
- One primary mitigation is modeled at a time to keep the cause-and-effect relationship easy to explain.
- Real DDoS defense is layered, but the simulator isolates individual controls to show why some are stronger fits than others.
- The metric named `Attack Pressure Reduced` represents hostile pressure reduced by the defense; some controls block traffic directly, while others reduce impact by distributing, absorbing, or limiting load.




