const DDoS_DATA = {
  metricOrder: ["serverLoad", "trafficServed", "attackBlocked", "availability"],

  metricLabels: {
    serverLoad: "Server Load",
    trafficServed: "Legitimate Traffic Served",
    attackBlocked: "Attack Pressure Reduced",
    availability: "Service Availability"
  },

  // These assumptions keep the simulator explainable for class discussion.
  assumptions: [
    "The simulation is deterministic so the same attack and mitigation pair produces the same result every time.",
    "Metric values are simplified teaching values rather than measurements from live packet captures or production monitoring.",
    "Each run models one primary mitigation at a time so the cause-and-effect relationship stays easy to explain.",
    "Comparison mode keeps the attack constant so the main variable is mitigation fit.",
    "Real DDoS defense is layered. The simulator isolates individual controls to highlight why different defenses help in different ways."
  ],

  riskBands: [
    {
      id: "low",
      name: "Low",
      max: 34,
      summary: "The chosen defense contains most of the attack pressure and legitimate service remains widely available."
    },
    {
      id: "medium",
      name: "Medium",
      max: 54,
      summary: "The defense improves resilience, but users would still notice degraded service."
    },
    {
      id: "high",
      name: "High",
      max: 74,
      summary: "The attack is still causing major stress and the mitigation is only partially aligned."
    },
    {
      id: "critical",
      name: "Critical",
      max: 100,
      summary: "The service remains at serious risk because the selected mitigation does not sufficiently reduce the dominant bottleneck."
    }
  ],

  tcpipLayers: [
    {
      id: "application",
      name: "Application Layer",
      protocols: "HTTP, DNS",
      projectExamples: "HTTP Flood, DNS Amplification",
      explanation: "This layer contains application protocols and service logic. In this project, HTTP Flood and DNS Amplification both rely on application-level protocol behavior even though their impact can spread downward into the network path."
    },
    {
      id: "transport",
      name: "Transport Layer",
      protocols: "TCP, UDP",
      projectExamples: "SYN Flood, UDP Flood",
      explanation: "This layer handles end-to-end delivery behavior. SYN Flood abuses TCP connection setup, while UDP Flood abuses connectionless traffic volume and packet handling."
    },
    {
      id: "internet",
      name: "Internet Layer",
      protocols: "IP addressing and routing",
      projectExamples: "DNS Amplification, volumetric traffic path effects",
      explanation: "The Internet layer becomes important when routing, source spoofing, and path-level congestion matter. DNS Amplification is especially relevant here because spoofed IP traffic and reflected responses stress the broader network path."
    },
    {
      id: "network-access",
      name: "Network Access Layer",
      protocols: "Local link delivery",
      projectExamples: "Congestion side effects",
      explanation: "This project does not focus on link-layer protocol mechanics, but high-volume attacks can still create congestion effects that are felt all the way down at local access links."
    }
  ],

  // Attack definitions double as simulator inputs and written guide content.
  attacks: {
    syn: {
      id: "syn",
      name: "SYN Flood",
      category: "Transport-layer state exhaustion",
      layer: "Transport",
      layers: ["Transport"],
      protocol: "TCP",
      protocols: ["TCP"],
      summary: "A SYN Flood overwhelms TCP connection setup by creating large numbers of half-open connections.",
      plainEnglish: "The attacker repeatedly starts TCP conversations but does not finish them. The server keeps track of these incomplete requests until its connection backlog begins to fill.",
      steps: [
        "The attacker sends many TCP SYN packets to begin new connections.",
        "The server replies with SYN-ACK responses and reserves connection state while waiting.",
        "The attacker does not send the final ACK needed to complete the handshake.",
        "The server accumulates many half-open connections and eventually has fewer resources left for legitimate clients."
      ],
      whyWorks: "TCP normally allocates some connection state before trust is fully established. That design is useful for normal communication, but it also creates a resource exhaustion opportunity when the attacker floods the handshake stage.",
      impact: "Legitimate users may fail to establish new sessions even when the web server or application is still running, because the transport layer is already overloaded with incomplete connection state.",
      mitigationDifficulty: "This attack is easier to describe than an application flood, but it can still be effective because transport-layer state can be consumed very quickly.",
      bestMitigations: ["syncookies", "rate", "filtering", "loadbalance"],
      keyTakeaway: "SYN Flood is a strong example of how exhausting connection setup can reduce availability before an application ever receives a full request.",
      severity: "High",
      detectionDifficulty: "Moderate",
      resourceExhausted: "Connection backlog entries and handshake state",
      protocolBehavior: "TCP uses a three-way handshake of SYN, SYN-ACK, and ACK. The attack exploits the fact that the server must track the conversation before the handshake is complete.",
      layerImpact: "The transport layer is directly targeted because connection establishment itself becomes the bottleneck.",
      serviceImpact: "Legitimate clients struggle to complete new TCP sessions because the server is already managing too many incomplete connection attempts.",
      recommendedMitigation: "syncookies",
      teachingNotes: [
        "This attack is about state exhaustion rather than expensive application processing.",
        "Defenses that protect the TCP handshake are stronger than generic application-only defenses here."
      ],
      baselines: {
        serverLoad: 91,
        trafficServed: 18,
        attackBlocked: 4,
        availability: 21
      }
    },

    http: {
      id: "http",
      name: "HTTP Flood",
      category: "Application-layer request exhaustion",
      layer: "Application",
      layers: ["Application", "Transport"],
      protocol: "HTTP",
      protocols: ["HTTP", "TCP"],
      summary: "An HTTP Flood overwhelms a web application by sending large numbers of normal-looking requests.",
      plainEnglish: "Instead of breaking the TCP handshake, the attacker sends requests that look valid enough for the server to process. That means the service can burn CPU, memory, and backend resources on malicious traffic.",
      steps: [
        "Bots send many HTTP requests to a target website or API.",
        "The requests may ask for pages, API endpoints, or computationally expensive resources.",
        "The server treats many of those requests as legitimate and begins normal processing.",
        "Application workers, CPU time, memory, and backend systems become overloaded."
      ],
      whyWorks: "The protocol behavior itself may look normal, so the target often cannot reject the requests immediately. The attack wins by making the server spend real work on requests that do not represent real users.",
      impact: "Users experience slow pages, delayed API responses, timeouts, or total service failure because application processing capacity is exhausted.",
      mitigationDifficulty: "Detection can be difficult because the attack traffic may resemble ordinary browsing. Defenders often need rate awareness, content awareness, or behavioral filtering rather than simple handshake protection.",
      bestMitigations: ["rate", "cdn", "loadbalance"],
      keyTakeaway: "HTTP Flood shows that a valid-looking request can still be malicious when it is used at scale to consume application resources.",
      severity: "Critical",
      detectionDifficulty: "High",
      resourceExhausted: "Application workers, CPU time, memory, and backend capacity",
      protocolBehavior: "HTTP requests may be syntactically correct, which means the server often performs real work before it can tell that the traffic is abusive.",
      layerImpact: "The application layer is the primary target, although transport connections still carry the flood into the service.",
      serviceImpact: "Real users see degraded or failed responses because the service is busy processing attack requests.",
      recommendedMitigation: "cdn",
      teachingNotes: [
        "A request can be valid at the protocol level and still be harmful at scale.",
        "Application-layer attacks often require behavior-aware defenses rather than only handshake protections."
      ],
      baselines: {
        serverLoad: 95,
        trafficServed: 24,
        attackBlocked: 7,
        availability: 23
      }
    },

    udp: {
      id: "udp",
      name: "UDP Flood",
      category: "Volumetric packet flood",
      layer: "Transport",
      layers: ["Transport", "Internet", "Network Access"],
      protocol: "UDP",
      protocols: ["UDP", "IP"],
      summary: "A UDP Flood sends very large numbers of datagrams to consume bandwidth and packet-processing capacity.",
      plainEnglish: "The attacker does not need to set up a connection first. Instead, it sends huge amounts of UDP traffic, often toward random or targeted ports, so the victim and the network path must spend time receiving, checking, or discarding packets.",
      steps: [
        "The attacker generates many UDP packets, often with high rate and volume.",
        "Packets may be sent to random ports or targeted services.",
        "The victim and upstream devices must inspect, route, or discard the traffic.",
        "Network capacity and packet-processing resources become congested."
      ],
      whyWorks: "UDP is connectionless, so it is easy to generate large traffic volumes quickly. The service path can become saturated even before application logic becomes the limiting factor.",
      impact: "Legitimate traffic experiences congestion, delay, or packet loss because links and packet-processing paths are busy handling the flood.",
      mitigationDifficulty: "Filtering can work if traffic patterns are obvious, but if the upstream path is already congested then local defenses may still arrive too late.",
      bestMitigations: ["filtering", "rate", "cdn"],
      keyTakeaway: "UDP Flood emphasizes that availability can be lost through raw traffic pressure even when there is no complex application logic involved.",
      severity: "High",
      detectionDifficulty: "Moderate",
      resourceExhausted: "Bandwidth and packet-processing capacity",
      protocolBehavior: "UDP does not require a connection handshake, which makes it efficient for both legitimate traffic and high-volume abuse.",
      layerImpact: "The transport layer is directly involved, but the resulting congestion also affects Internet-layer routing paths and local access capacity.",
      serviceImpact: "Legitimate users suffer because the network path is too congested to carry normal traffic reliably.",
      recommendedMitigation: "filtering",
      teachingNotes: [
        "Stopping traffic earlier in the path matters when the main problem is volume.",
        "A correct host-level defense can still be insufficient if the path to the host is already saturated."
      ],
      baselines: {
        serverLoad: 80,
        trafficServed: 33,
        attackBlocked: 9,
        availability: 31
      }
    },

    dns: {
      id: "dns",
      name: "DNS Amplification",
      category: "Reflection and amplification attack",
      layer: "Application",
      layers: ["Application", "Transport", "Internet"],
      protocol: "DNS over UDP",
      protocols: ["DNS", "UDP", "IP"],
      summary: "DNS Amplification uses spoofed requests and open resolvers so small queries create much larger responses toward the victim.",
      plainEnglish: "The attacker tricks DNS resolvers into sending amplified responses to the victim instead of back to the attacker. The victim receives much more traffic than the attacker had to send directly.",
      steps: [
        "The attacker sends DNS queries to open resolvers using the victim's IP address as the spoofed source.",
        "The DNS resolvers believe the victim requested the data and send responses to that address.",
        "Because some DNS queries produce larger responses than the original request, the traffic is amplified.",
        "The victim receives a large stream of reflected traffic and its upstream path becomes congested."
      ],
      whyWorks: "The attack combines source spoofing with protocol amplification. The victim is overwhelmed by traffic that was generated by third-party resolvers instead of by direct end hosts alone.",
      impact: "Availability is reduced because the network edge and upstream bandwidth become overloaded before the target service can respond normally.",
      mitigationDifficulty: "The victim may not control the open resolvers that generated the traffic, so mitigation often depends on upstream filtering, edge absorption, and infrastructure-scale protection.",
      bestMitigations: ["cdn", "filtering", "rate"],
      keyTakeaway: "DNS Amplification demonstrates that an application protocol can be abused to create a much larger Internet-path congestion problem.",
      severity: "Critical",
      detectionDifficulty: "High",
      resourceExhausted: "Upstream bandwidth and edge absorption capacity",
      protocolBehavior: "DNS commonly uses UDP, and some DNS answers are much larger than the query that triggered them. That asymmetry creates amplification potential.",
      layerImpact: "The abuse begins with DNS at the application layer, but the operational damage spreads across UDP delivery and IP routing paths.",
      serviceImpact: "The service becomes hard to reach because the victim's network edge is overwhelmed by reflected traffic.",
      recommendedMitigation: "cdn",
      teachingNotes: [
        "Source spoofing and reflection make attribution and filtering more difficult.",
        "Distributed absorption is often more realistic than origin-only defense for a large reflected flood."
      ],
      baselines: {
        serverLoad: 88,
        trafficServed: 22,
        attackBlocked: 6,
        availability: 19
      }
    }
  },

  // Mitigation definitions include both educational descriptions and metric offsets.
  mitigations: {
    none: {
      id: "none",
      name: "No Mitigation",
      description: "This baseline option represents a service that has no meaningful DDoS-specific protection in front of the attack path.",
      bestAgainst: [],
      layerRelevance: "Baseline only",
      strengths: ["Useful as a comparison baseline"],
      limitations: ["Provides no actual defense", "Shows the uncontrolled attack impact instead of reducing it"],
      exampleUse: "Use this when you want to compare how much a real mitigation changes the result.",
      keyTakeaway: "The baseline matters because a mitigation is easier to understand when compared to the uncontrolled case.",
      actsAt: "No mitigation applied",
      effects: {
        default: {
          serverLoad: 0,
          trafficServed: 0,
          attackBlocked: 0,
          availability: 0,
          fit: 0.05
        }
      }
    },

    rate: {
      id: "rate",
      name: "Rate Limiting",
      description: "Rate limiting restricts how many requests or packets a source, connection group, or client population can send in a given window of time.",
      bestAgainst: ["http", "udp", "syn"],
      layerRelevance: "Edge routing, reverse proxy, or application gateway control",
      strengths: [
        "Reduces abusive bursts and request spikes",
        "Can improve resilience before traffic reaches the application",
        "Useful when request rate is part of the problem"
      ],
      limitations: [
        "May slow legitimate bursts",
        "Distributed attacks can reduce its effectiveness",
        "Low-and-slow behavior may avoid simple thresholds"
      ],
      exampleUse: "A reverse proxy enforces per-client request caps during a high-volume HTTP flood.",
      keyTakeaway: "Rate limiting is broadly useful, but it is not equally strong against every attack style.",
      actsAt: "Edge router, reverse proxy, or application gateway",
      effects: {
        default: { serverLoad: -10, trafficServed: 12, attackBlocked: 18, availability: 12, fit: 0.58 },
        syn: { serverLoad: -14, trafficServed: 15, attackBlocked: 22, availability: 15, fit: 0.68 },
        http: { serverLoad: -18, trafficServed: 20, attackBlocked: 26, availability: 20, fit: 0.79 },
        udp: { serverLoad: -16, trafficServed: 15, attackBlocked: 27, availability: 18, fit: 0.74 },
        dns: { serverLoad: -10, trafficServed: 10, attackBlocked: 17, availability: 11, fit: 0.49 }
      }
    },

    syncookies: {
      id: "syncookies",
      name: "SYN Cookies",
      description: "SYN cookies protect the TCP handshake by delaying connection-state allocation until the client proves it can complete the handshake.",
      bestAgainst: ["syn"],
      layerRelevance: "Transport-layer protocol hardening",
      strengths: [
        "Very strong against TCP handshake abuse",
        "Directly reduces half-open connection pressure",
        "Targets the exact bottleneck in a SYN flood"
      ],
      limitations: [
        "Not a general-purpose DDoS solution",
        "Does not solve application-layer floods",
        "Does not absorb large upstream volumetric traffic"
      ],
      exampleUse: "A server enables SYN cookies to keep its TCP backlog from filling during a SYN flood.",
      keyTakeaway: "SYN cookies are highly effective when the problem is incomplete TCP handshakes, but not when the problem is elsewhere.",
      actsAt: "TCP stack during handshake validation",
      effects: {
        default: { serverLoad: -3, trafficServed: 4, attackBlocked: 6, availability: 4, fit: 0.18 },
        syn: { serverLoad: -36, trafficServed: 41, attackBlocked: 49, availability: 43, fit: 0.97 },
        http: { serverLoad: -2, trafficServed: 3, attackBlocked: 4, availability: 3, fit: 0.12 },
        udp: { serverLoad: -1, trafficServed: 2, attackBlocked: 2, availability: 2, fit: 0.08 },
        dns: { serverLoad: -1, trafficServed: 2, attackBlocked: 2, availability: 2, fit: 0.08 }
      }
    },

    filtering: {
      id: "filtering",
      name: "Traffic Filtering",
      description: "Traffic filtering drops suspicious traffic based on ports, patterns, signatures, protocol behavior, or source characteristics before it reaches the protected service.",
      bestAgainst: ["udp", "dns", "syn"],
      layerRelevance: "Firewall, router ACL, or upstream scrubbing control",
      strengths: [
        "Useful against obvious volumetric patterns",
        "Can stop traffic earlier in the path",
        "Helpful when the attack has recognizable packet or routing characteristics"
      ],
      limitations: [
        "False positives are possible",
        "Filtering quality depends on visibility and rule quality",
        "Harder when malicious traffic closely resembles legitimate traffic"
      ],
      exampleUse: "A provider drops reflected DNS response patterns before they reach the victim edge.",
      keyTakeaway: "Filtering is strongest when defenders can identify the hostile pattern early and block it before the service absorbs the load.",
      actsAt: "Firewall, router ACL, or scrubbing service",
      effects: {
        default: { serverLoad: -16, trafficServed: 17, attackBlocked: 28, availability: 20, fit: 0.74 },
        syn: { serverLoad: -20, trafficServed: 21, attackBlocked: 34, availability: 24, fit: 0.82 },
        http: { serverLoad: -8, trafficServed: 9, attackBlocked: 13, availability: 9, fit: 0.38 },
        udp: { serverLoad: -21, trafficServed: 22, attackBlocked: 42, availability: 25, fit: 0.87 },
        dns: { serverLoad: -18, trafficServed: 16, attackBlocked: 34, availability: 22, fit: 0.81 }
      }
    },

    loadbalance: {
      id: "loadbalance",
      name: "Load Balancing",
      description: "Load balancing distributes traffic across multiple servers or service instances so one host does not fail as quickly under pressure.",
      bestAgainst: ["http", "syn"],
      layerRelevance: "Service-tier resilience and infrastructure scaling",
      strengths: [
        "Improves resilience by sharing work across systems",
        "Can help absorb moderate service-tier pressure",
        "Useful when the bottleneck is concentrated on a single origin or pool member"
      ],
      limitations: [
        "Does not eliminate the attack itself",
        "May simply spread the problem if all instances are equally stressed",
        "Less effective when the main issue is upstream bandwidth saturation"
      ],
      exampleUse: "A website distributes requests across several backend servers during an HTTP request surge.",
      keyTakeaway: "Load balancing improves resilience, but resilience is not the same as true removal of hostile traffic.",
      actsAt: "Reverse proxy tier or distributed server pool",
      effects: {
        default: { serverLoad: -12, trafficServed: 18, attackBlocked: 12, availability: 18, fit: 0.57 },
        syn: { serverLoad: -12, trafficServed: 14, attackBlocked: 10, availability: 12, fit: 0.45 },
        http: { serverLoad: -21, trafficServed: 24, attackBlocked: 16, availability: 24, fit: 0.76 },
        udp: { serverLoad: -7, trafficServed: 8, attackBlocked: 6, availability: 7, fit: 0.25 },
        dns: { serverLoad: -9, trafficServed: 9, attackBlocked: 8, availability: 8, fit: 0.28 }
      }
    },

    cdn: {
      id: "cdn",
      name: "CDN / Anycast Absorption",
      description: "A CDN or Anycast-style edge network spreads traffic across many distributed points of presence so large request volume or reflected traffic is absorbed before it reaches the origin.",
      bestAgainst: ["dns", "http", "udp"],
      layerRelevance: "Distributed edge infrastructure and path-level absorption",
      strengths: [
        "Strong for large distributed traffic volume",
        "Improves edge resilience and geographic distribution",
        "Useful when the attack stresses the path before the origin can defend itself"
      ],
      limitations: [
        "Does not replace protocol-specific hardening",
        "Works best when traffic can actually be handled at the edge",
        "Origin-specific behavior may still need additional controls"
      ],
      exampleUse: "A globally distributed edge network absorbs a DNS amplification flood before the origin edge is saturated.",
      keyTakeaway: "CDN or Anycast absorption is especially valuable when the main problem is path-level scale rather than only local host behavior.",
      actsAt: "Distributed edge network and Anycast presence",
      effects: {
        default: { serverLoad: -17, trafficServed: 19, attackBlocked: 24, availability: 21, fit: 0.72 },
        syn: { serverLoad: -10, trafficServed: 11, attackBlocked: 12, availability: 11, fit: 0.36 },
        http: { serverLoad: -26, trafficServed: 29, attackBlocked: 30, availability: 29, fit: 0.86 },
        udp: { serverLoad: -18, trafficServed: 18, attackBlocked: 26, availability: 20, fit: 0.72 },
        dns: { serverLoad: -31, trafficServed: 31, attackBlocked: 40, availability: 35, fit: 0.93 }
      }
    }
  },

  presets: [
    {
      id: "syn-baseline",
      name: "SYN Flood Baseline",
      attack: "syn",
      mitigation: "none",
      compareMitigation: "syncookies",
      description: "Shows how SYN cookies reduce transport-layer handshake pressure compared with no mitigation."
    },
    {
      id: "http-comparison",
      name: "HTTP Flood Comparison",
      attack: "http",
      mitigation: "syncookies",
      compareMitigation: "cdn",
      description: "Demonstrates why a TCP-handshake defense is a weak match for an application-layer request flood."
    },
    {
      id: "dns-comparison",
      name: "DNS Amplification Comparison",
      attack: "dns",
      mitigation: "none",
      compareMitigation: "cdn",
      description: "Highlights why reflected amplification attacks often benefit from distributed absorption or upstream filtering."
    },
    {
      id: "udp-filtering",
      name: "UDP Flood with Filtering",
      attack: "udp",
      mitigation: "filtering",
      compareMitigation: "rate",
      description: "Shows the difference between direct filtering and generic throttling for a packet-volume attack."
    }
  ],

  walkthroughs: [
    {
      id: "walkthrough-1",
      title: "Scenario 1: SYN Flood Before and After SYN Cookies",
      attack: "syn",
      firstMitigation: "none",
      secondMitigation: "syncookies",
      summary: "Start with no mitigation and then switch to SYN cookies to see what a strong protocol-level match looks like.",
      whatToSelect: "Select SYN Flood with No Mitigation, run the simulation, then compare it with SYN Cookies.",
      whatToNotice: "Server load should fall, attack pressure reduced should rise, and service availability should increase because SYN cookies directly reduce half-open connection pressure.",
      reasoning: "The attack targets TCP handshake state, so a mitigation that specifically protects handshake allocation is a strong fit."
    },
    {
      id: "walkthrough-2",
      title: "Scenario 2: HTTP Flood With a Weak Match and a Better Match",
      attack: "http",
      firstMitigation: "syncookies",
      secondMitigation: "cdn",
      summary: "Use a weak transport-level defense first, then switch to a better application or edge-oriented defense.",
      whatToSelect: "Select HTTP Flood with SYN Cookies, run the simulation, then compare it with CDN / Anycast Absorption or Rate Limiting.",
      whatToNotice: "SYN cookies should not improve the result much because the real problem is application request processing, not the initial TCP handshake. CDN or Rate Limiting should preserve more service availability.",
      reasoning: "This scenario proves that a mitigation can be technically valid in general but still be a poor match for a specific attack mechanism."
    },
    {
      id: "walkthrough-3",
      title: "Scenario 3: DNS Amplification and Distributed Defense",
      attack: "dns",
      firstMitigation: "none",
      secondMitigation: "cdn",
      summary: "Compare the uncontrolled reflected flood with a mitigation that absorbs or filters traffic before the origin edge is overwhelmed.",
      whatToSelect: "Select DNS Amplification with No Mitigation, then compare it with CDN / Anycast Absorption or Traffic Filtering.",
      whatToNotice: "The better mitigation should block more hostile pressure and raise availability because reflected amplification is primarily a scale and path problem.",
      reasoning: "Spoofing and amplification mean the victim receives much more traffic than the attacker had to send directly, so distributed absorption or upstream filtering is often the stronger response."
    }
  ],

  glossary: [
    {
      term: "DDoS",
      definition: "Distributed Denial-of-Service. An attack that uses many traffic sources to reduce or remove access to a service."
    },
    {
      term: "Availability",
      definition: "The security property that focuses on whether legitimate users can still access a service when they need it."
    },
    {
      term: "TCP",
      definition: "Transmission Control Protocol. A connection-oriented transport protocol that uses a handshake before data transfer."
    },
    {
      term: "UDP",
      definition: "User Datagram Protocol. A connectionless transport protocol that sends datagrams without first establishing a session."
    },
    {
      term: "Three-way handshake",
      definition: "The TCP setup sequence of SYN, SYN-ACK, and ACK used to establish a connection."
    },
    {
      term: "SYN",
      definition: "A TCP synchronization packet used to begin a new connection."
    },
    {
      term: "ACK",
      definition: "An acknowledgment message. In the TCP handshake, it completes connection setup after SYN and SYN-ACK."
    },
    {
      term: "Half-open connection",
      definition: "A partially established TCP connection in which the handshake has started but not fully completed."
    },
    {
      term: "HTTP",
      definition: "Hypertext Transfer Protocol, commonly used for web pages and web APIs."
    },
    {
      term: "DNS",
      definition: "Domain Name System, which translates names like example.com into IP addresses."
    },
    {
      term: "Amplification",
      definition: "A situation where a small request triggers a much larger response, increasing the attack's traffic impact."
    },
    {
      term: "Spoofing",
      definition: "Falsifying source information, such as an IP address, so traffic appears to come from somewhere else."
    },
    {
      term: "Rate limiting",
      definition: "Restricting how quickly a client or source group can send requests or packets."
    },
    {
      term: "SYN cookies",
      definition: "A TCP defense that delays connection-state allocation until the client proves it can finish the handshake."
    },
    {
      term: "Anycast",
      definition: "A routing approach where many distributed locations advertise the same address so traffic is absorbed across multiple sites."
    },
    {
      term: "CDN",
      definition: "Content Delivery Network. A distributed edge service that can cache, terminate, or absorb traffic closer to users."
    },
    {
      term: "Load balancing",
      definition: "Distributing incoming requests across multiple servers or service instances to improve resilience."
    },
    {
      term: "Traffic filtering",
      definition: "Dropping or blocking traffic that matches suspicious patterns, ports, packet characteristics, or source behavior."
    }
  ],

  references: [
    {
      label: 'IBM, "What is a Distributed Denial-of-Service (DDoS) attack?"',
      url: "https://www.ibm.com/think/topics/ddos"
    },
    {
      label: 'Radware, "What is a TCP SYN Flood Attack?"',
      url: "https://www.radware.com/security/ddos-knowledge-center/ddospedia/tcp-flood/"
    },
    {
      label: 'Cloudflare, "DDoS Mitigation Strategies"',
      url: "https://www.cloudflare.com/learning/ddos/ddos-mitigation/"
    }
  ]
};
