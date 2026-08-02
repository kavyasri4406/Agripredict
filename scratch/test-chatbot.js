const pestKeywords = [
  "pest", "disease", "insect", "precaution", "control", "spray", "prevent", "bugs", "fungus",
  "తెగుళ్లు", "తెగులు", "వ్యాధి", "పురుగు", "పురుగులు", "నివారణ", "జాగ్రత్తలు", "మందులు",
  "பூச்சி", "நோய்", "கட்டுப்பாடு", "தடுப்பு"
];

const CROPS = [
  { id: "rice", name: "Rice (Paddy)", nameTA: "நெல்", nameTE: "వరి" },
  { id: "cotton", name: "Cotton", nameTA: "பருத்தி", nameTE: "పత్తి" }
];

function findAllCropsInQuery(query) {
  const lower = query.toLowerCase();
  const matched = [];
  for (const crop of CROPS) {
    const names = [
      crop.name.toLowerCase(),
      crop.nameTA.toLowerCase(),
      crop.nameTE.toLowerCase(),
      crop.id.toLowerCase()
    ];
    if (names.some(name => lower.includes(name))) {
      matched.push(crop);
    }
  }
  return matched;
}

const query = "వరి లేదా పత్తి పంటలలో తెగుళ్లు రాకుండా ఎలాంటి ముందుస్తు జాగ్రత్తలు తీసుకోవాలి?";
const lower = query.toLowerCase();
const isPestQuery = pestKeywords.some(k => lower.includes(k));
const matchedCrops = findAllCropsInQuery(query);

console.log("Query:", query);
console.log("isPestQuery:", isPestQuery);
console.log("matchedCrops:", matchedCrops.map(c => c.id));
