const appState = {
  lastResult: null,
  lastComparison: null,
  history: [],
  defaultScenario: {
    attackId: "syn",
    mitigationId: "none",
    compareMitigationId: "syncookies"
  }
};

const metricIds = DDoS_DATA.metricOrder;

function byId(id) {
  return document.getElementById(id);
}

function clampPercentage(value) {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function createOption(value, label) {
  const option = document.createElement("option");
  option.value = value;
  option.textContent = label;
  return option;
}

function getFitLabel(fitScore) {
  if (fitScore >= 0.9) {
    return "Strong match";
  }
  if (fitScore >= 0.7) {
    return "Useful match";
  }
  if (fitScore >= 0.45) {
    return "Partial match";
  }
  return "Weak match";
}

function formatBestAgainst(bestAgainstIds) {
  if (!bestAgainstIds.length) {
    return "baseline comparison only";
  }

  return bestAgainstIds.map((attackId) => DDoS_DATA.attacks[attackId].name).join(", ");
}

function renderAttackGuides() {
  const container = byId("attackGuidesGrid");
  if (!container) {
    return;
  }

  container.innerHTML = "";
  Object.values(DDoS_DATA.attacks).forEach((attack) => {
    const card = document.createElement("article");
    card.className = "guide-card";
    card.innerHTML = `
      <div class="guide-header">
        <div>
          <p class="section-kicker">Attack Guide</p>
          <h3>${attack.name}</h3>
        </div>
        <a class="btn-link secondary small" href="simulator.html?attack=${attack.id}&mitigation=${attack.recommendedMitigation}">Open In Simulator</a>
      </div>
      <div class="guide-meta">
        <span class="hero-tag">Targeted TCP/IP layer: ${attack.layer}</span>
        <span class="hero-tag">Main protocol: ${attack.protocol}</span>
      </div>
      <div class="guide-section">
        <h4>Plain-English Explanation</h4>
        <p>${attack.plainEnglish}</p>
      </div>
      <div class="guide-section">
        <h4>Step-by-Step Attack Process</h4>
        <ol class="takeaway-list">${attack.steps.map((step) => `<li>${step}</li>`).join("")}</ol>
      </div>
      <div class="guide-section">
        <h4>Why The Attack Works</h4>
        <p>${attack.whyWorks}</p>
      </div>
      <div class="guide-section">
        <h4>Network and Service Impact</h4>
        <p>${attack.impact}</p>
      </div>
      <div class="guide-section">
        <h4>Why Detection or Mitigation Can Be Difficult</h4>
        <p>${attack.mitigationDifficulty}</p>
      </div>
      <div class="guide-section">
        <h4>Best-Fit Mitigations</h4>
        <p>${attack.bestMitigations.map((mitigationId) => DDoS_DATA.mitigations[mitigationId].name).join(", ")}.</p>
      </div>
      <div class="guide-section takeaway-callout">
        <h4>Key Takeaway</h4>
        <p>${attack.keyTakeaway}</p>
      </div>
    `;
    container.appendChild(card);
  });
}

function renderMitigationGuides() {
  const container = byId("mitigationGuidesGrid");
  if (!container) {
    return;
  }

  container.innerHTML = "";
  Object.values(DDoS_DATA.mitigations)
    .filter((mitigation) => mitigation.id !== "none")
    .forEach((mitigation) => {
      const card = document.createElement("article");
      card.className = "guide-card";
      card.innerHTML = `
        <div class="guide-header">
          <div>
            <p class="section-kicker">Mitigation Guide</p>
            <h3>${mitigation.name}</h3>
          </div>
        </div>
        <div class="guide-meta">
          <span class="hero-tag">Best attack types: ${formatBestAgainst(mitigation.bestAgainst)}</span>
          <span class="hero-tag">Layer/control area: ${mitigation.layerRelevance}</span>
        </div>
        <div class="guide-section">
          <h4>What It Does</h4>
          <p>${mitigation.description}</p>
        </div>
        <div class="guide-section">
          <h4>Strengths</h4>
          <ul class="takeaway-list">${mitigation.strengths.map((item) => `<li>${item}</li>`).join("")}</ul>
        </div>
        <div class="guide-section">
          <h4>Limitations and Tradeoffs</h4>
          <ul class="takeaway-list">${mitigation.limitations.map((item) => `<li>${item}</li>`).join("")}</ul>
        </div>
        <div class="guide-section">
          <h4>Example Use</h4>
          <p>${mitigation.exampleUse}</p>
        </div>
        <div class="guide-section takeaway-callout">
          <h4>Key Takeaway</h4>
          <p>${mitigation.keyTakeaway}</p>
        </div>
      `;
      container.appendChild(card);
    });
}

function renderTcpipGrid() {
  const container = byId("tcpipGrid");
  if (!container) {
    return;
  }

  container.innerHTML = "";
  DDoS_DATA.tcpipLayers.forEach((layer) => {
    const card = document.createElement("article");
    card.className = "tcpip-card";
    card.innerHTML = `
      <h3>${layer.name}</h3>
      <p><strong>Protocols:</strong> ${layer.protocols}</p>
      <p><strong>Project examples:</strong> ${layer.projectExamples}</p>
      <p><strong>Security relevance:</strong> ${layer.explanation}</p>
    `;
    container.appendChild(card);
  });
}

function renderWalkthroughs() {
  const container = byId("walkthroughGrid");
  if (!container) {
    return;
  }

  container.innerHTML = "";
  DDoS_DATA.walkthroughs.forEach((scenario) => {
    const card = document.createElement("article");
    card.className = "walkthrough-card";
    card.innerHTML = `
      <h3>${scenario.title}</h3>
      <p>${scenario.summary}</p>
      <div class="guide-section">
        <h4>What To Select</h4>
        <p>${scenario.whatToSelect}</p>
      </div>
      <div class="guide-section">
        <h4>What Should Change In The Metrics</h4>
        <p>${scenario.whatToNotice}</p>
      </div>
      <div class="guide-section">
        <h4>Why The Fit Matters</h4>
        <p>${scenario.reasoning}</p>
      </div>
      <div class="walkthrough-actions">
        <a class="btn-link secondary small" href="simulator.html?attack=${scenario.attack}&mitigation=${scenario.firstMitigation}&compare=${scenario.secondMitigation}">Open In Simulator</a>
      </div>
    `;
    container.appendChild(card);
  });
}

function clearLayerMap() {
  document.querySelectorAll(".layer-card").forEach((card) => {
    card.classList.remove("active");
  });
}

function renderGlossary() {
  const container = byId("glossaryGrid");
  if (!container) {
    return;
  }

  container.innerHTML = "";
  DDoS_DATA.glossary.forEach((entry) => {
    const card = document.createElement("article");
    card.className = "glossary-card";
    card.innerHTML = `
      <h3>${entry.term}</h3>
      <p>${entry.definition}</p>
    `;
    container.appendChild(card);
  });
}

function renderReferences() {
  const list = byId("referencesList");
  if (!list) {
    return;
  }

  list.innerHTML = "";
  DDoS_DATA.references.forEach((reference) => {
    const item = document.createElement("li");
    if (reference.url) {
      const link = document.createElement("a");
      link.href = reference.url;
      link.textContent = reference.label;
      link.target = "_blank";
      link.rel = "noreferrer";
      item.appendChild(link);
    } else {
      item.textContent = reference.label;
    }
    list.appendChild(item);
  });
}

function initSimulator() {
  const attackSelect = byId("attackSelect");
  const mitigationSelect = byId("mitigationSelect");
  const compareMitigationSelect = byId("compareMitigationSelect");
  const presetSelect = byId("presetSelect");

  if (!attackSelect || !mitigationSelect || !compareMitigationSelect || !presetSelect) {
    return;
  }

  const controls = {
    attack: attackSelect,
    mitigation: mitigationSelect,
    compareMitigation: compareMitigationSelect,
    preset: presetSelect,
    details: byId("detailsBtn"),
    run: byId("runBtn"),
    compare: byId("compareBtn"),
    random: byId("randomBtn"),
    save: byId("saveBtn"),
    reset: byId("resetBtn"),
    applyRecommended: byId("applyRecommendedBtn")
  };

  function getAttack(attackId = controls.attack.value) {
    return DDoS_DATA.attacks[attackId];
  }

  function getMitigation(mitigationId = controls.mitigation.value) {
    return DDoS_DATA.mitigations[mitigationId];
  }

  function getCompareMitigation() {
    return DDoS_DATA.mitigations[controls.compareMitigation.value];
  }

  function getMitigationEffect(attackId, mitigationId) {
    const mitigation = DDoS_DATA.mitigations[mitigationId];
    return mitigation.effects[attackId] || mitigation.effects.default;
  }

  function calculateRiskScore(metrics) {
    // Simplified educational scoring model, not a real operational formula.
    return clampPercentage(
      (100 - metrics.availability) * 0.45 +
      metrics.serverLoad * 0.27 -
      metrics.attackBlocked * 0.18 +
      (100 - metrics.trafficServed) * 0.1
    );
  }

  function getRiskBand(score) {
    return DDoS_DATA.riskBands.find((band) => score <= band.max);
  }

  function buildMetrics(attackId, mitigationId) {
    const attack = getAttack(attackId);
    const mitigation = getMitigation(mitigationId);
    const effect = getMitigationEffect(attackId, mitigationId);
    const metrics = {};

    // Attack baselines are intentionally adjusted by mitigation offsets.
    metricIds.forEach((metricId) => {
      metrics[metricId] = clampPercentage(attack.baselines[metricId] + effect[metricId]);
    });

    const fitScore = effect.fit;
    const fitLabel = getFitLabel(fitScore);
    const riskScore = calculateRiskScore(metrics);
    const riskBand = getRiskBand(riskScore);

    return {
      attack,
      mitigation,
      metrics,
      fitScore,
      fitLabel,
      riskScore,
      riskLevel: riskBand.name,
      riskSummary: riskBand.summary,
      explanation: buildMitigationAnalysis(attack, mitigation, metrics, fitLabel),
      interpretation: buildInterpretation(attack, mitigation, metrics, fitLabel, riskBand.name),
      takeaways: buildTakeaways(attack, mitigation, metrics, fitLabel),
      timeline: buildTimeline(attack, mitigation, metrics, fitLabel),
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    };
  }

  function buildMitigationAnalysis(attack, mitigation, metrics, fitLabel) {
    if (mitigation.id === "none") {
      return `No mitigation is applied, so ${attack.name} continues to pressure ${attack.resourceExhausted.toLowerCase()}. This baseline highlights the uncontrolled attack path.`;
    }

    const baseAnalysis =
      `${mitigation.name} operates at the ${mitigation.actsAt.toLowerCase()}. ${mitigation.description} ` +
      `In this simplified model it reduces about ${metrics.attackBlocked}% of hostile pressure and is considered a ${fitLabel.toLowerCase()} ` +
      `because the attack mainly exhausts ${attack.resourceExhausted.toLowerCase()}.`;

    const weakMatchNotes = {
      "http:syncookies": "SYN cookies are a weak match against HTTP Flood because the main pressure occurs during application request processing after the TCP session is already established, not during the initial TCP handshake.",
      "udp:syncookies": "SYN cookies do not directly address UDP Flood because UDP is connectionless and the attack does not rely on TCP half-open connection state.",
      "dns:syncookies": "SYN cookies are weak against DNS Amplification because the reflected flood rides on UDP and spoofed source behavior rather than on incomplete TCP handshakes.",
      "dns:loadbalance": "Load balancing can help distribute some origin demand, but it is weaker against DNS Amplification because it does not remove large reflected traffic volumes before they reach the victim's edge or upstream path.",
      "http:rate": "Rate limiting can help HTTP Flood, but distributed bot traffic can reduce the effectiveness of simple per-source thresholds when many clients each stay below the configured limit."
    };

    const noteKey = `${attack.id}:${mitigation.id}`;
    const weakMatchNote =
      weakMatchNotes[noteKey] ||
      (fitLabel === "Weak Fit"
        ? `This is a weak match because the defense acts at the ${mitigation.actsAt.toLowerCase()}, while the dominant pressure in ${attack.name} is created by ${attack.resourceExhausted.toLowerCase()}.`
        : fitLabel === "Partial Fit"
          ? `This is only a partial match because it helps with part of the attack path, but it does not fully remove the main bottleneck.`
          : "");

    return weakMatchNote ? `${baseAnalysis} ${weakMatchNote}` : baseAnalysis;
  }

  function buildInterpretation(attack, mitigation, metrics, fitLabel, riskLevel) {
    if (mitigation.id === "none") {
      return `${attack.name} remains largely uncontrolled. Availability falls to ${metrics.availability}%, which means legitimate users would likely experience severe disruption.`;
    }

    if (riskLevel === "Low") {
      return `${mitigation.name} is highly effective here because it aligns closely with the attack mechanism. The model keeps availability at ${metrics.availability}%.`;
    }

    if (riskLevel === "Medium") {
      return `${mitigation.name} improves resilience, but users would still notice degraded service. This is a good example of a ${fitLabel.toLowerCase()} rather than a perfect solution.`;
    }

    if (riskLevel === "High") {
      return `${mitigation.name} helps somewhat, but the attack still causes major strain. This suggests the defense is only partially aligned with the bottleneck being exploited.`;
    }

    return `${mitigation.name} is a weak match in this scenario. The attack still reduces availability heavily, so a different or layered defense would be more appropriate.`;
  }

  function buildTakeaways(attack, mitigation, metrics, fitLabel) {
    return [
      `${attack.name} mainly exhausts ${attack.resourceExhausted.toLowerCase()}.`,
      `${mitigation.name} is modeled as a ${fitLabel.toLowerCase()} for this attack.`,
      `Availability at ${metrics.availability}% and legitimate traffic served at ${metrics.trafficServed}% summarize how users experience the incident.`,
      attack.keyTakeaway
    ];
  }

  function buildTimeline(attack, mitigation, metrics, fitLabel) {
    return [
      `${attack.name} begins and targets the ${attack.layers.join(" / ")} path using ${attack.protocols.join(", ")} behavior.`,
      `Pressure builds because ${attack.serviceImpact.toLowerCase()}`,
      mitigation.id === "none"
        ? "No dedicated DDoS mitigation engages, so the service absorbs the full baseline impact."
        : `${mitigation.name} engages at the ${mitigation.actsAt.toLowerCase()} and reduces part of the hostile pressure.`,
      `Attack pressure reduced reaches ${metrics.attackBlocked}% and legitimate traffic served rises to ${metrics.trafficServed}%.`,
      `Outcome: ${metrics.availability}% service availability and a ${fitLabel.toLowerCase()} defense fit.`
    ];
  }

  function buildRecommendation(attack) {
    const mitigation = DDoS_DATA.mitigations[attack.recommendedMitigation];
    const effect = getMitigationEffect(attack.id, mitigation.id);
    return {
      mitigation,
      fitLabel: getFitLabel(effect.fit),
      text: `${mitigation.name} is recommended first for ${attack.name} because ${mitigation.description.toLowerCase()} That makes it a strong match for the main problem here: ${attack.resourceExhausted.toLowerCase()}.`
    };
  }

  function populateControls() {
    Object.values(DDoS_DATA.attacks).forEach((attack) => {
      controls.attack.appendChild(createOption(attack.id, attack.name));
    });

    Object.values(DDoS_DATA.mitigations).forEach((mitigation) => {
      controls.mitigation.appendChild(createOption(mitigation.id, mitigation.name));
      controls.compareMitigation.appendChild(createOption(mitigation.id, mitigation.name));
    });

    controls.preset.appendChild(createOption("", "Custom scenario"));
    DDoS_DATA.presets.forEach((preset) => {
      controls.preset.appendChild(createOption(preset.id, preset.name));
    });
  }

  function setMetric(metricId, value) {
    const text = byId(`${metricId}Text`);
    const bar = byId(`${metricId}Bar`);
    if (text) {
      text.textContent = `${value}%`;
    }
    if (bar) {
      bar.style.width = `${value}%`;
    }
  }

  function renderMetrics(metrics) {
    metricIds.forEach((metricId) => {
      setMetric(metricId, metrics[metricId]);
    });
  }

  function renderLayerMap(attack) {
    document.querySelectorAll(".layer-card").forEach((card) => {
      card.classList.toggle("active", attack.layers.includes(card.dataset.layer));
    });
  }

  function renderTakeaways(items) {
    const list = byId("takeawaysList");
    if (!list) {
      return;
    }

    list.innerHTML = "";
    items.forEach((item) => {
      const entry = document.createElement("li");
      entry.textContent = item;
      list.appendChild(entry);
    });
  }

  function renderTimeline(items) {
    const list = byId("timeline");
    if (!list) {
      return;
    }

    list.innerHTML = "";
    items.forEach((item) => {
      const entry = document.createElement("li");
      entry.textContent = item;
      list.appendChild(entry);
    });
  }

  function updateRiskBadge(level, summary) {
    const badge = byId("riskBadge");
    const note = byId("riskSummary");
    if (badge) {
      badge.textContent = level;
      badge.className = `risk-badge risk-${level.toLowerCase()}`;
    }
    if (note) {
      note.textContent = summary;
    }
  }

  function updateSelectionPills() {
    byId("currentAttack").textContent = getAttack().name;
    byId("currentMitigation").textContent = getMitigation().name;
    byId("currentCompareMitigation").textContent = getCompareMitigation().name;
    byId("heroFocus").textContent = `${getAttack().category} and mitigation tradeoffs`;
  }

  function renderRecommendation() {
    const recommendation = buildRecommendation(getAttack());
    byId("recommendationTitle").textContent = `${recommendation.mitigation.name} Recommended`;
    byId("recommendationFit").textContent = recommendation.fitLabel;
    byId("recommendationText").textContent = recommendation.text;
  }

  function renderAttackDetails() {
    const attack = getAttack();
    const mitigation = getMitigation();

    byId("categoryDisplay").textContent = attack.category;
    byId("layerDisplay").textContent = attack.layer;
    byId("protocolDisplay").textContent = attack.protocol;
    byId("severityDisplay").textContent = `${attack.severity} | ${attack.detectionDifficulty} detection`;
    byId("attackOverview").textContent = `${attack.summary} ${attack.plainEnglish}`;
    byId("protocolBehavior").textContent = attack.protocolBehavior;
    byId("layerImpact").textContent = attack.layerImpact;
    byId("mitigationAnalysis").textContent = `${mitigation.name} relates to ${mitigation.layerRelevance.toLowerCase()}. ${mitigation.description} Best against: ${formatBestAgainst(mitigation.bestAgainst)}.`;
    byId("scenarioBadge").textContent = `${attack.name} | ${attack.layer} layer focus`;

    renderLayerMap(attack);
    renderTakeaways([
      attack.teachingNotes[0],
      attack.teachingNotes[1],
      `Recommended first-line mitigation: ${DDoS_DATA.mitigations[attack.recommendedMitigation].name}.`
    ]);
    renderRecommendation();
  }

  function renderResult(result) {
    renderMetrics(result.metrics);
    byId("mitigationAnalysis").textContent = result.explanation;
    byId("interpretation").textContent = result.interpretation;
    byId("scenarioBadge").textContent = `${result.attack.name} vs ${result.mitigation.name} | ${result.fitLabel}`;
    updateRiskBadge(result.riskLevel, result.riskSummary);
    renderTimeline(result.timeline);
    renderTakeaways(result.takeaways);
    appState.lastResult = result;
  }

  function renderComparisonMetrics(container, result) {
    const rows = [
      ["Availability", `${result.metrics.availability}%`],
      ["Attack Pressure Reduced", `${result.metrics.attackBlocked}%`],
      ["Server Load", `${result.metrics.serverLoad}%`],
      ["Legitimate Traffic", `${result.metrics.trafficServed}%`],
      ["Risk Score", `${result.riskScore}%`]
    ];

    container.innerHTML = "";
    rows.forEach(([term, value]) => {
      const dt = document.createElement("dt");
      const dd = document.createElement("dd");
      dt.textContent = term;
      dd.textContent = value;
      container.appendChild(dt);
      container.appendChild(dd);
    });
  }

  function renderComparison(primaryResult, secondaryResult) {
    byId("comparisonState").hidden = true;
    byId("comparisonGrid").hidden = false;

    byId("comparePrimaryTitle").textContent = primaryResult.mitigation.name;
    byId("compareSecondaryTitle").textContent = secondaryResult.mitigation.name;
    byId("comparePrimaryRisk").textContent = `Risk: ${primaryResult.riskLevel}`;
    byId("compareSecondaryRisk").textContent = `Risk: ${secondaryResult.riskLevel}`;
    byId("comparePrimaryFit").textContent = primaryResult.fitLabel;
    byId("compareSecondaryFit").textContent = secondaryResult.fitLabel;
    byId("comparePrimaryNote").textContent = primaryResult.interpretation;
    byId("compareSecondaryNote").textContent = secondaryResult.interpretation;

    renderComparisonMetrics(byId("comparePrimaryMetrics"), primaryResult);
    renderComparisonMetrics(byId("compareSecondaryMetrics"), secondaryResult);

    const winner =
      primaryResult.metrics.availability > secondaryResult.metrics.availability
        ? primaryResult
        : primaryResult.metrics.availability < secondaryResult.metrics.availability
          ? secondaryResult
          : primaryResult.riskScore <= secondaryResult.riskScore
            ? primaryResult
            : secondaryResult;
    const loser = winner === primaryResult ? secondaryResult : primaryResult;

    byId("comparisonVerdict").textContent =
      `${winner.mitigation.name} performs better in this model because it preserves ${winner.metrics.availability}% availability compared with ${loser.metrics.availability}% for ${loser.mitigation.name}.`;

    appState.lastComparison = { primaryResult, secondaryResult };
  }

  function renderHistory() {
    const historyList = byId("historyList");
    const empty = byId("historyEmpty");
    if (!historyList || !empty) {
      return;
    }

    historyList.innerHTML = "";
    if (!appState.history.length) {
      empty.hidden = false;
      return;
    }

    empty.hidden = true;
    appState.history.forEach((entry) => {
      const card = document.createElement("article");
      card.className = "history-item";
      card.innerHTML = `
        <div class="history-item-header">
          <div>
            <strong>${entry.attack.name} with ${entry.mitigation.name}</strong>
            <p>${entry.interpretation}</p>
          </div>
          <span class="history-tag">${entry.timestamp}</span>
        </div>
        <div class="history-tags">
          <span class="history-tag">Availability ${entry.metrics.availability}%</span>
          <span class="history-tag">Pressure Reduced ${entry.metrics.attackBlocked}%</span>
          <span class="history-tag">Risk ${entry.riskLevel}</span>
        </div>
      `;
      historyList.appendChild(card);
    });
  }

  function setScenarioSelection({ attackId, mitigationId, compareMitigationId }) {
    controls.attack.value = attackId;
    controls.mitigation.value = mitigationId;
    controls.compareMitigation.value = compareMitigationId;
  }

  function clearResultPanels() {
    const attack = getAttack();
    const mitigation = getMitigation();

    renderMetrics({
      serverLoad: 0,
      trafficServed: 0,
      attackBlocked: 0,
      availability: 0
    });

    byId("mitigationAnalysis").textContent =
      `${mitigation.name} is currently selected for ${attack.name}. Run the simulation to see whether that pairing is a strong, partial, or weak fit.`;
    byId("interpretation").textContent =
      `${attack.name} is currently selected, but not yet simulated. Run the model to connect its protocol behavior to changes in server load, attack pressure reduced, and service availability.`;
    byId("scenarioBadge").textContent = `Selected: ${attack.name} | run to simulate`;
    byId("comparisonState").hidden = false;
    byId("comparisonGrid").hidden = true;
    byId("comparisonVerdict").textContent = "No comparison verdict yet.";
    clearLayerMap();
    renderTakeaways([
      `${attack.name} is currently selected as the attack scenario.`,
      `${mitigation.name} is the current mitigation choice being prepared for analysis.`,
      "Run the simulation to turn the current selection into measured outcomes and a defense-fit interpretation."
    ]);
    renderTimeline(["Select an attack and mitigation strategy to begin exploring the model."]);
    updateRiskBadge("Not Simulated", "Run a scenario to evaluate service health and residual risk.");
    byId("riskBadge").className = "risk-badge neutral";
  }

  function runSimulation() {
    renderAttackDetails();
    const result = buildMetrics(controls.attack.value, controls.mitigation.value);
    renderResult(result);
  }

  function runComparison() {
    renderAttackDetails();
    const primaryResult = buildMetrics(controls.attack.value, controls.mitigation.value);
    const secondaryResult = buildMetrics(controls.attack.value, controls.compareMitigation.value);
    renderResult(primaryResult);
    renderComparison(primaryResult, secondaryResult);
  }

  function saveCurrentResult() {
    if (!appState.lastResult) {
      return;
    }

    appState.history.unshift(appState.lastResult);
    appState.history = appState.history.slice(0, 8);
    renderHistory();
  }

  function applyPreset() {
    const preset = DDoS_DATA.presets.find((item) => item.id === controls.preset.value);
    if (!preset) {
      updateSelectionPills();
      renderAttackDetails();
      return;
    }

    setScenarioSelection({
      attackId: preset.attack,
      mitigationId: preset.mitigation,
      compareMitigationId: preset.compareMitigation
    });

    updateSelectionPills();
    renderAttackDetails();
    byId("comparisonVerdict").textContent = preset.description;
  }

  function pickRandomScenario() {
    const attackIds = Object.keys(DDoS_DATA.attacks);
    const mitigationIds = Object.keys(DDoS_DATA.mitigations);

    setScenarioSelection({
      attackId: attackIds[Math.floor(Math.random() * attackIds.length)],
      mitigationId: mitigationIds[Math.floor(Math.random() * mitigationIds.length)],
      compareMitigationId: mitigationIds[Math.floor(Math.random() * mitigationIds.length)]
    });

    controls.preset.value = "";
    updateSelectionPills();
    renderAttackDetails();
  }

  function applyRecommendedMitigation() {
    const attack = getAttack();
    controls.mitigation.value = attack.recommendedMitigation;
    updateSelectionPills();
    renderAttackDetails();
  }

  function applyQueryScenario() {
    const params = new URLSearchParams(window.location.search);
    const attackId = params.get("attack");
    const mitigationId = params.get("mitigation");
    const compareMitigationId = params.get("compare");

    if (attackId && DDoS_DATA.attacks[attackId]) {
      controls.attack.value = attackId;
    }
    if (mitigationId && DDoS_DATA.mitigations[mitigationId]) {
      controls.mitigation.value = mitigationId;
    }
    if (compareMitigationId && DDoS_DATA.mitigations[compareMitigationId]) {
      controls.compareMitigation.value = compareMitigationId;
    }
  }

  function handleScenarioChange() {
    controls.preset.value = "";
    updateSelectionPills();
    renderAttackDetails();
    clearResultPanels();
  }

  populateControls();
  applyQueryScenario();

  // Simulator event listeners only attach on simulator.html.
  controls.attack.addEventListener("change", handleScenarioChange);
  controls.mitigation.addEventListener("change", handleScenarioChange);
  controls.compareMitigation.addEventListener("change", () => {
    controls.preset.value = "";
    updateSelectionPills();
    clearResultPanels();
  });
  controls.preset.addEventListener("change", applyPreset);
  if (controls.details) {
    controls.details.addEventListener("click", renderAttackDetails);
  }
  if (controls.run) {
    controls.run.addEventListener("click", runSimulation);
  }
  if (controls.compare) {
    controls.compare.addEventListener("click", runComparison);
  }
  if (controls.random) {
    controls.random.addEventListener("click", pickRandomScenario);
  }
  if (controls.save) {
    controls.save.addEventListener("click", saveCurrentResult);
  }
  if (controls.reset) {
    controls.reset.addEventListener("click", resetApp);
  }
  if (controls.applyRecommended) {
    controls.applyRecommended.addEventListener("click", applyRecommendedMitigation);
  }

  function resetApp() {
    setScenarioSelection(appState.defaultScenario);
    controls.preset.value = "";
    appState.lastResult = null;
    appState.lastComparison = null;
    appState.history = [];

    applyQueryScenario();
    updateSelectionPills();
    renderAttackDetails();
    renderHistory();
    clearResultPanels();
  }

  resetApp();
}

function initPage() {
  renderAttackGuides();
  renderMitigationGuides();
  renderTcpipGrid();
  renderWalkthroughs();
  renderGlossary();
  renderReferences();
  initSimulator();
}

initPage();
