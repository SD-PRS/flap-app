import React, { useMemo, useRef, useState } from "react";

const FLAPS = [
  {
    id: "radial-forearm",
    name: "Radial Forearm Free Flap",
    defaultMinutes: 4,
    script: `Mathes and Nahai type B fasciocutaneous flap. The pedicle is the radial artery with paired venae comitantes, and I can include the cephalic vein for additional venous outflow. A sensate flap can be harvested with the lateral antebrachial cutaneous nerve.

Pre-operatively, I would perform an Allen’s test to confirm adequate ulnar-sided perfusion, assess for a history of radial arterial line use, and use the non-dominant extremity. I’d mark the radial artery and reverse-template the defect onto the non-dominant forearm.

This will be done in the main OR under GA. The patient is supine, with the arm abducted and supinated on an arm board under tourniquet control. The flap axis is from the middle of the AC fossa toward the scaphoid tubercle, between brachioradialis and flexor carpi radialis. My borders are 3 cm proximal to the wrist crease distally, BR radially, FCR ulnarly, and the middle one-third of the forearm proximally.

I would raise the flap distal to proximal and ulnar to radial. Distally, I incise through skin and identify the radial artery between the fan-shaped BR tendon and FCR, then ligate the radial artery and venae comitantes distally. On the ulnar side, I preserve the paratenon over the flexor tendons. Radially, I include the cephalic vein where possible and protect the superficial radial nerve. As I proceed proximally, I clip side branches, keep the radial artery incorporated within the flap, and protect the lateral antebrachial cutaneous nerve. Proximally, I confirm I am dividing the radial artery, not the brachial artery, before dividing the pedicle and transferring the flap.

For the donor site, I close what I can primarily, then resurface the remaining defect with a split-thickness skin graft from the thigh, inset with staples, and apply a bolster and a volar resting splint with the hand in POSI. For the thigh, I apply a Xeroform dressing.

Post-operatively, I would admit to the ICU for hourly flap monitoring with Doppler and clinical checks, and monitor the donor site for graft take.`,
    rubric: [
      { concept: "Mathes and Nahai type B fasciocutaneous flap", terms: ["Mathes and Nahai", "type B", "fasciocutaneous"] },
      { concept: "Radial artery pedicle", terms: ["radial artery", "radial vessels"] },
      { concept: "Paired venae comitantes", terms: ["venae comitantes", "paired veins", "concomitant veins"] },
      { concept: "Optional cephalic vein for venous outflow", terms: ["cephalic vein", "additional venous outflow", "supplemental venous drainage"] },
      { concept: "Sensate flap with LABC nerve", terms: ["lateral antebrachial cutaneous", "LABC", "sensate"] },
      { concept: "Allen test and ulnar-sided perfusion", terms: ["Allen", "ulnar perfusion", "hand perfusion"] },
      { concept: "Avoid prior radial arterial line and use non-dominant side", terms: ["radial arterial line", "previous radial", "non dominant"] },
      { concept: "Mark radial artery and reverse-template defect", terms: ["mark radial artery", "reverse template", "template defect"] },
      { concept: "Supine, arm abducted and supinated on arm board", terms: ["supine", "arm abducted", "supinated", "arm board"] },
      { concept: "Tourniquet control", terms: ["tourniquet"] },
      { concept: "Axis from AC fossa to scaphoid tubercle", terms: ["AC fossa", "antecubital", "scaphoid tubercle"] },
      { concept: "Between brachioradialis and FCR", terms: ["brachioradialis", "BR", "flexor carpi radialis", "FCR"] },
      { concept: "Borders including 3 cm proximal to wrist crease", terms: ["3 cm", "wrist crease", "middle one third"] },
      { concept: "Raise distal to proximal and ulnar to radial", terms: ["distal to proximal", "ulnar to radial"] },
      { concept: "Distal radial artery and venae ligation", terms: ["ligate radial artery", "ligate venae", "distal ligation"] },
      { concept: "Preserve paratenon over flexor tendons", terms: ["paratenon", "flexor tendons"] },
      { concept: "Protect superficial radial nerve", terms: ["superficial radial nerve"] },
      { concept: "Clip side branches and keep radial artery in flap", terms: ["side branches", "clip", "radial artery incorporated"] },
      { concept: "Protect LABC nerve proximally", terms: ["lateral antebrachial cutaneous", "LABC"] },
      { concept: "Confirm radial artery, not brachial artery, before division", terms: ["not brachial", "confirm radial", "brachial artery"] },
      { concept: "Donor site STSG from thigh", terms: ["split thickness", "STSG", "thigh"] },
      { concept: "Bolster and volar resting splint in POSI", terms: ["bolster", "volar resting splint", "POSI", "position of safety"] },
      { concept: "ICU hourly flap monitoring", terms: ["ICU", "hourly", "Doppler", "clinical checks", "flap monitoring"] },
      { concept: "Monitor donor site graft take", terms: ["graft take", "donor site"] },
    ],
  },
];

function normalize(text) {
  return String(text || "")
    .toLowerCase()
    .replaceAll("’", "")
    .replaceAll("'", "")
    .split("")
    .map((char) => {
      const isLetter = char >= "a" && char <= "z";
      const isNumber = char >= "0" && char <= "9";
      return isLetter || isNumber ? char : " ";
    })
    .join("")
    .split(" ")
    .filter(Boolean)
    .join(" ");
}

function prepareFlap(flap) {
  return {
    ...flap,
    rubric: flap.rubric.map((item) => ({
      ...item,
      normalizedTerms: item.terms.map((term) => normalize(term)),
    })),
  };
}

function scoreFlap(flap, transcript) {
  const cleanTranscript = normalize(transcript);

  const results = flap.rubric.map((item) => {
    const matchedTerms = item.terms.filter((term, index) =>
      cleanTranscript.includes(item.normalizedTerms[index])
    );

    return {
      concept: item.concept,
      matchedTerms,
      passed: matchedTerms.length > 0,
    };
  });

  const covered = results.filter((item) => item.passed).length;
  const score = results.length ? Math.round((covered / results.length) * 100) : 0;

  return {
    score,
    covered,
    total: results.length,
    missed: results.filter((item) => !item.passed),
  };
}

function formatTime(totalSeconds) {
  const minutes = Math.floor(totalSeconds / 60).toString().padStart(2, "0");
  const seconds = Math.floor(totalSeconds % 60).toString().padStart(2, "0");
  return `${minutes}:${seconds}`;
}

function escapeHtml(text) {
  return String(text)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function HighlightedScript({ flap }) {
  let html = escapeHtml(flap.script);

  flap.rubric.forEach((item) => {
    item.terms.forEach((term) => {
      const safeTerm = escapeHtml(term);
      html = html.split(safeTerm).join(`<mark>${safeTerm}</mark>`);
    });
  });

  return <div className="scriptText" dangerouslySetInnerHTML={{ __html: html }} />;
}

export default function App() {
  const flaps = useMemo(() => FLAPS.map(prepareFlap), []);
  const [selectedFlapId, setSelectedFlapId] = useState(null);
  const [timeLimit, setTimeLimit] = useState(4);
  const [elapsed, setElapsed] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [showScript, setShowScript] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const recognitionRef = useRef(null);
  const timerRef = useRef(null);
  const startTimeRef = useRef(null);
  const transcriptRef = useRef("");

  const selectedFlap = flaps.find((flap) => flap.id === selectedFlapId);
  const targetSeconds = timeLimit * 60;

  function stopRecognition() {
    if (timerRef.current) window.clearInterval(timerRef.current);
    timerRef.current = null;

    if (recognitionRef.current) {
      recognitionRef.current.onresult = null;
      recognitionRef.current.onerror = null;
      recognitionRef.current.onend = null;

      try {
        recognitionRef.current.stop();
      } catch {
        // Ignore browser stop errors.
      }
    }

    recognitionRef.current = null;
  }

  function resetPractice() {
    stopRecognition();
    setElapsed(0);
    setIsRunning(false);
    setShowScript(false);
    setResult(null);
    setError("");
    transcriptRef.current = "";
  }

  function enterFlap(flap) {
    resetPractice();
    setSelectedFlapId(flap.id);
    setTimeLimit(flap.defaultMinutes);
  }

  function goBack() {
    resetPractice();
    setSelectedFlapId(null);
  }

  function startPractice() {
    if (!selectedFlap) return;

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setError(
        "Speech recognition is not available in this browser. Try Chrome on Android or desktop Chrome. iPhone Safari may not support this reliably."
      );
      return;
    }

    resetPractice();
    setIsRunning(true);
    startTimeRef.current = Date.now();

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.lang = "en-US";

    recognition.onresult = (event) => {
      let newText = "";

      for (let i = event.resultIndex; i < event.results.length; i++) {
        newText += event.results[i][0].transcript + " ";
      }

      transcriptRef.current = `${transcriptRef.current} ${newText}`.trim();
    };

    recognition.onerror = (event) => {
      setError(`Speech recognition error: ${event.error}. You may need to retry in Chrome.`);
      endPractice();
    };

    recognition.onend = () => {
      recognitionRef.current = null;
    };

    recognitionRef.current = recognition;

    try {
      recognition.start();
    } catch {
      setIsRunning(false);
      setError("Could not start the microphone. Refresh and try again.");
      return;
    }

    timerRef.current = window.setInterval(() => {
      if (!startTimeRef.current) return;
      setElapsed(Math.floor((Date.now() - startTimeRef.current) / 1000));
    }, 1000);
  }

  function endPractice() {
    if (!selectedFlap) return;

    stopRecognition();

    const finalTranscript = transcriptRef.current;
    setResult(scoreFlap(selectedFlap, finalTranscript));
    setIsRunning(false);
  }

  if (!selectedFlap) {
    return (
      <main className="app shell">
        <style>{styles}</style>

        <section className="topCard">
          <div className="brand">Flap App</div>
          <h1>Pick a flap</h1>
          <p className="subtle">
            Choose a flap, set your time, practice, then see your score and missed key points.
          </p>
        </section>

        <section className="flapList">
          {flaps.map((flap) => (
            <button className="flapButton" key={flap.id} onClick={() => enterFlap(flap)}>
              <span>{flap.name}</span>
              <small>{flap.rubric.length} key points</small>
            </button>
          ))}
        </section>
      </main>
    );
  }

  return (
    <main className="app">
      <style>{styles}</style>

      <header className="practiceHeader">
        <button className="backButton" onClick={goBack}>
          Back
        </button>

        <div>
          <div className="brand small">Flap App</div>
          <h1>{selectedFlap.name}</h1>
        </div>
      </header>

      {error && <div className="error">{error}</div>}

      <section className="timerCard">
        <div className="timer">{formatTime(elapsed)}</div>

        <label className="timeLimit">
          Time limit
          <select
            value={timeLimit}
            onChange={(event) => setTimeLimit(Number(event.target.value))}
            disabled={isRunning}
          >
            {[2, 3, 4, 5, 6, 8, 10].map((minutes) => (
              <option key={minutes} value={minutes}>
                {minutes} min
              </option>
            ))}
          </select>
        </label>

        <div className={elapsed > targetSeconds ? "over" : "under"}>
          {elapsed > targetSeconds
            ? `${elapsed - targetSeconds}s over`
            : `${targetSeconds - elapsed}s left`}
        </div>
      </section>

      <section className="actions">
        {!isRunning ? (
          <button className="primary" onClick={startPractice}>
            Start
          </button>
        ) : (
          <button className="end" onClick={endPractice}>
            End
          </button>
        )}

        <button
          className="secondary"
          onClick={() => setShowScript((value) => !value)}
          disabled={isRunning}
        >
          {showScript ? "Hide script" : "Script"}
        </button>
      </section>

      {showScript && (
        <section className="scriptCard">
          <h2>Recommended script</h2>
          <p className="subtle">Highlighted terms are scoring targets.</p>
          <HighlightedScript flap={selectedFlap} />
        </section>
      )}

      {result && (
        <section className="resultCard">
          <div className="scoreCircle">{result.score}%</div>
          <h2>
            {result.covered}/{result.total} key points covered
          </h2>
          <p className="subtle">Time: {formatTime(elapsed)}</p>

          {result.missed.length ? (
            <>
              <h3>Missed key points</h3>
              <ul>
                {result.missed.map((item) => (
                  <li key={item.concept}>{item.concept}</li>
                ))}
              </ul>
            </>
          ) : (
            <p className="subtle">No missed key points.</p>
          )}

          <button className="secondary wide" onClick={resetPractice}>
            Try again
          </button>
        </section>
      )}
    </main>
  );
}

const styles = `
* {
  box-sizing: border-box;
}

body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif;
  background: #f8fafc;
  color: #0f172a;
}

.app {
  min-height: 100vh;
  max-width: 680px;
  margin: 0 auto;
  padding: 18px;
}

.shell {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.topCard,
.timerCard,
.scriptCard,
.resultCard {
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 26px;
  padding: 20px;
  box-shadow: 0 10px 30px rgba(15, 23, 42, 0.05);
}

.brand {
  color: #475569;
  font-size: 15px;
  font-weight: 800;
  letter-spacing: 0.02em;
  text-transform: uppercase;
}

.brand.small {
  font-size: 12px;
}

h1 {
  font-size: 34px;
  line-height: 1.02;
  margin: 8px 0 8px;
  letter-spacing: -0.04em;
}

h2 {
  font-size: 22px;
  margin: 0 0 8px;
}

h3 {
  font-size: 16px;
  margin: 20px 0 8px;
}

.subtle {
  color: #64748b;
  line-height: 1.45;
  margin: 0;
}

.flapList {
  display: grid;
  gap: 12px;
}

.flapButton {
  width: 100%;
  text-align: left;
  border: 1px solid #e2e8f0;
  background: white;
  color: #0f172a;
  border-radius: 22px;
  padding: 18px;
  font-size: 18px;
  font-weight: 800;
  display: flex;
  flex-direction: column;
  gap: 6px;
  box-shadow: 0 8px 20px rgba(15, 23, 42, 0.04);
}

.flapButton small {
  color: #64748b;
  font-size: 13px;
  font-weight: 650;
}

.practiceHeader {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 12px;
  align-items: start;
  margin-bottom: 14px;
}

.backButton {
  border: 1px solid #cbd5e1;
  background: white;
  color: #0f172a;
  border-radius: 999px;
  padding: 10px 13px;
  font-weight: 800;
}

.error {
  background: #fef2f2;
  color: #991b1b;
  border: 1px solid #fecaca;
  border-radius: 18px;
  padding: 12px;
  margin: 12px 0;
}

.timerCard {
  display: grid;
  gap: 12px;
  text-align: center;
}

.timer {
  font-size: 68px;
  font-weight: 900;
  letter-spacing: -0.06em;
}

.timeLimit {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 10px;
  color: #475569;
  font-weight: 750;
}

select {
  border: 1px solid #cbd5e1;
  border-radius: 14px;
  padding: 10px 12px;
  font-size: 16px;
  background: white;
}

.under {
  color: #16a34a;
  font-weight: 850;
}

.over {
  color: #dc2626;
  font-weight: 850;
}

.actions {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin: 14px 0;
}

button {
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
}

button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.primary,
.end,
.secondary {
  border: 0;
  border-radius: 999px;
  padding: 18px;
  font-size: 18px;
  font-weight: 900;
}

.primary {
  background: #0f172a;
  color: white;
}

.end {
  background: #dc2626;
  color: white;
}

.secondary {
  background: white;
  color: #0f172a;
  border: 1px solid #cbd5e1;
}

.wide {
  width: 100%;
  margin-top: 12px;
}

.scriptText {
  white-space: pre-wrap;
  line-height: 1.65;
  color: #334155;
  font-size: 16px;
}

mark {
  background: #fef08a;
  color: #0f172a;
  border-radius: 6px;
  padding: 1px 3px;
}

.resultCard {
  text-align: center;
  margin-top: 14px;
}

.scoreCircle {
  width: 132px;
  height: 132px;
  border-radius: 999px;
  background: #0f172a;
  color: white;
  display: grid;
  place-items: center;
  font-size: 40px;
  font-weight: 900;
  margin: 0 auto 16px;
}

ul {
  text-align: left;
  color: #334155;
  line-height: 1.5;
  padding-left: 20px;
}

@media (max-width: 480px) {
  .app {
    padding: 14px;
  }

  h1 {
    font-size: 28px;
  }

  .timer {
    font-size: 56px;
  }

  .primary,
  .end,
  .secondary {
    padding: 16px;
    font-size: 17px;
  }

  .scriptText {
    font-size: 15px;
  }
}
`;