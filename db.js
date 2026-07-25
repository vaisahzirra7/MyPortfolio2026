// Simple file-based JSON storage. No native modules, no compilation step -
// just Node's built-in fs. Works identically on any OS with no setup.

const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, 'data');
const DB_PATH = path.join(DATA_DIR, 'portfolio.json');

const seedData = {
  siteInfo: {
    name: 'Zirra Vaisah Peter',
    photo: '',
    title_line: 'Cybersecurity Graduate, Researcher | Ethical Hacker | Digital Security Advocate | TEDx Speaker Curator',
    tagline: 'I break systems to make them safer — vulnerability assessment, penetration testing, and secure software, grounded in research and community leadership.',
    about_text: "I'm a cybersecurity graduate of North-Eastern University, Gombe, where I closed out my degree with a 5.00 CGPA and four consecutive Pro-Chancellor's Academic Excellence Awards. What pulled me into this field was a simple curiosity about how things break — and that curiosity has since taken me from vulnerability scanning and penetration testing to building AI-assisted security tools and publishing research on where artificial intelligence and cybersecurity collide in Nigeria's digital landscape.\n\nI like building things that solve real problems where I am — an automated vulnerability dashboard, a clinic management system for my university's health centre, a fleet management platform, an LLM-augmented pentesting framework. Practical, secure, and useful to the people who actually use them.\n\nOutside the technical work, I've spent a lot of my university years in rooms where decisions get made — as General Secretary of TEDxNorth-Eastern University, as a Senator in the Students' Representative Assembly, on the committee that reviewed our SRC constitution. I've come to believe good security work and good leadership run on the same instinct: stay calm, think clearly, and explain it simply enough that anyone can act on it.",
    about_short: 'Cybersecurity graduate specializing in vulnerability assessment, penetration testing, and AI-assisted security research. TEDx organizer and published researcher.',
    email: 'vaisahzirra7@gmail.com',
    email_alt: 'vaisah.zirra@student.neu.edu.ng',
    linkedin: 'https://www.linkedin.com/in/vaisah-peter-zirra-0ba6842b7/',
    github: 'https://github.com/vaisahzirra7',
    scholar: 'https://scholar.google.com/citations?hl=en&user=Y298ugoAAAAJ',
    researchgate: 'https://www.researchgate.net/profile/Vaisah-Peter-Zirra',
    instagram: 'https://www.instagram.com/northernodogwu/',
  },
  skills: [
    ['Burp Suite', 'Security'], ['Nessus', 'Security'], ['OpenVAS', 'Security'],
    ['Wireshark', 'Security'], ['Kali Linux', 'Security'], ['Nmap', 'Security'],
    ['Cisco Packet Tracer', 'Security'], ['Process Monitor', 'Security'], ['Process Explorer', 'Security'],
    ['Python', 'Development'], ['Flask', 'Development'], ['Django', 'Development'],
    ['PHP', 'Development'], ['JavaScript', 'Development'], ['HTML', 'Development'],
    ['CSS', 'Development'], ['MySQL', 'Development'], ['SQL Server', 'Development'],
    ['MongoDB', 'Development'], ['WordPress', 'Development'], ['Wix', 'Development'],
    ['Notepad++', 'Development'], ['Sublime Text', 'Development'], ['Brackets', 'Development'],
    ['Anaconda', 'Data & AI'], ['Apache Spark', 'Data & AI'], ['Pandas', 'Data & AI'],
    ['NLP / Sentiment Analysis', 'Data & AI'],
    ['Adobe Photoshop', 'Design'], ['Adobe Illustrator', 'Design'], ['Lightroom', 'Design'],
    ['CorelDRAW', 'Design'], ['Figma', 'Design'], ['SketchUp', 'Design'], ['AutoCAD', 'Design'],
    ['MS Office Suite', 'Productivity'],
  ].map(([name, category], i) => ({ name, category, sort_order: i })),
  projects: [
    ['VanaraIntelliScan', 'LLM-augmented vulnerability assessment and pentest framework. AI-assisted risk prioritization and remediation recommendations.', 'AI, Security, Python', ''],
    ['VanaraOpenDash', 'Automated vulnerability assessment dashboard built on OpenVAS, with live security metrics and reporting.', 'Security, Dashboard, OpenVAS', ''],
    ['VanaraUniCare', "Clinic management system built for NEU's health centre — patient records, scheduling, treatment history.", 'Web App, Healthcare', ''],
    ['VanaraFleetOps', 'Fleet management system automating vehicle allocation, driver assignment, and maintenance tracking.', 'Web App, Operations', ''],
    ['Web App Security Testing Platform', 'A deliberately vulnerable Flask/MySQL app demonstrating stored XSS and HTML injection, built to study secure coding practices.', 'Security, Flask, MySQL', ''],
    ['Fingerprint Recognition System', 'Biometric matching system in MATLAB — preprocessing, feature extraction, GUI.', 'Biometrics, MATLAB', ''],
    ['ML Election Prediction', 'NLP-based sentiment analysis of election-related social media data, deployed via Flask.', 'AI, NLP, Flask', ''],
    ['University Past Question Archive', 'Centralized, access-controlled repository of past exam papers for students and staff.', 'Web App, Education', ''],
  ].map(([title, description, tags, link], i) => ({ title, description, tags, link, sort_order: i })),
  experience: [
    ['Member, Constitution Review Committee', '2026 SRC Administration, Students\u2019 Representative Assembly, NEU', '2026', 'Reviewed the existing SRC Constitution and identified areas requiring amendment.'],
    ['Senator', '2nd Students\u2019 Representative Assembly, NEU', 'Nov 2025 \u2013 June 2026', 'Represented student interests, participated in legislative deliberations and policy discussions.'],
    ['General Secretary', 'TEDxNorth-Eastern University', 'Feb 2025 \u2013 July 2026', 'Coordinated team activities, documentation, and communication; supported planning and execution of TEDx events.'],
    ['Member, Speaker Curation Committee', 'TEDxNorth-Eastern University', '2025 \u2013 July 2026', 'Selected, mentored, and supported speakers delivering TEDx talks.'],
    ['Student Volunteer', 'North-Eastern University, Gombe', 'Jan 2023 \u2013 July 2026', 'Assisted with student orientation, admissions, and official university activities.'],
    ['Community Outreach Volunteer', 'Multi-Team Projects', '2021 \u2013 present', 'Humanitarian visits to orphanages, rehab centers, and prisons.'],
    ['Organizer', 'Young Programmers Training, Evangel College', 'Aug 2018', 'Trained secondary school students in basic IT and programming concepts.'],
  ].map(([role, org, period, description], i) => ({ role, org, period, description, sort_order: i })),
  research: [
    ['Conference Paper', 'AI and Cybersecurity: Navigating Innovation and Vulnerability in Nigeria\u2019s Digital Landscape', 'UNESCO World Philosophy Day, Abuja', '2024', 'Co-authored academic paper exploring innovation and vulnerability in Nigeria\u2019s AI-driven digital security space.'],
    ['Journal Publication', 'AI and Cybersecurity: Navigating Innovation and Vulnerability in Nigeria\u2019s Digital Landscape', 'Philosophia Politica: Journal of African Political Philosophy and Leadership, Vol. 3 No. 1', '2024', ''],
    ['Talk', 'The MITRE ATT&CK Framework', 'Inaugural Student Seminar Series, Dept. of Computer Science, NEU', '2024', 'Technical presentation on adversarial tactics and MITRE ATT&CK\u2019s role in cybersecurity defence.'],
    ['Talk', 'ML-Based Election Prediction System using NLP', 'Student Week Lecture Day, NEU', '2024', 'Technical presentation on an election prediction system using NLP.'],
  ].map(([type, title, venue, year, description], i) => ({ type, title, venue, year, description, sort_order: i })),
  certifications: [
    ['Certified Ransomware Protection Officer (CRPO)', 'European Union Agency for Cybersecurity (ENISA)', '2026', 'Cybersecurity', 1],
    ['Certified Cybersecurity Educator Professional (CCEP)', 'Red Team Leaders', '2026', 'Cybersecurity', 1],
    ['Security Risk Management Professional (SRMP) \u2013 Country', 'INSSA x DisasterReady.org', '2025', 'Cybersecurity', 1],
    ['Ethical Hacking', 'CISCO', '2024', 'Cybersecurity', 0],
    ['Cyber Threat Management', 'CISCO', '2023', 'Cybersecurity', 0],
    ['Network Technician', 'CISCO', '2023', 'Cybersecurity', 0],
    ['Network Defence', 'CISCO', '2023', 'Cybersecurity', 0],
    ['Introduction to Cybersecurity', 'CISCO', '2023', 'Cybersecurity', 0],
    ['Cybersecurity & Ethical Hacking', 'NIPES', '2025', 'Cybersecurity', 0],
    ['Cyber Security Certification', 'Pitronix Solutions', '2025', 'Cybersecurity', 0],
    ['Cybersecurity Awareness Training 2022', 'Amazon ACA', '2025', 'Cybersecurity', 0],
    ['Network Security Management', 'DigitalXpert System Limited', '2025', 'Cybersecurity', 0],
    ['Database Design and Administration', 'DigitalXpert System Limited', '2025', 'Cybersecurity', 0],
    ['Security Risk Management Professional \u2013 Country level Examination', 'INSSA', '2025', 'Cybersecurity', 0],
    ['Internet Security', 'OPSWAT', '2026', 'Cybersecurity', 0],
    ['Digital Footprints', 'OPSWAT', '2026', 'Cybersecurity', 0],
    ['What the Internet Needs to Exist', 'OPSWAT', '2026', 'Cybersecurity', 0],
    ['Advanced Data Analytics', 'NIPES', '2025', 'Data & AI', 0],
    ['Big Data with Apache Spark (Professional Certificate)', 'ML.org', '\u2014', 'Data & AI', 0],
    ['Digital Marketing Professional Certification', 'Digital Adda', '2025', 'Other', 0],
    ['Mobile Web Development', 'Google Africa Developers Program', '2020', 'Development', 0],
    ['PHP with MySQL for Web Development', 'Udemy', '2022', 'Development', 0],
    ['HTML Web Design Certification', 'Programming Hub', '2022', 'Development', 0],
    ['Software Testing Fundamentals', "Byju's", '2022', 'Development', 0],
    ['Certificate in Graphic Design and Branding', 'Diplomatic Teens Network', '2019', 'Design', 0],
    ['Unilever Level-Up Entrepreneurship Skills Course', 'Unilever', '2023', 'Other', 0],
    ['Professional Soft Skills Training', 'Jobberman x Mastercard Foundation', '2023', 'Other', 0],
    ['Awareness Workshop on Open Knowledge & Editing', 'Wikimedia Foundation', '2022', 'Other', 0],
    ['Certificate of Participation, Entrepreneurship Summit 2.0', 'Innovate X', '2025', 'Other', 0],
  ].map(([name, issuer, year, category, featured], i) => ({ name, issuer, year, category, featured, sort_order: i })),
  awards: [
    ["Pro-Chancellor\u2019s Academic Excellence Award (5.00 CGPA)", 'North-Eastern University, Gombe', '2025/2026'],
    ["Pro-Chancellor\u2019s Academic Excellence Award (5.00 CGPA)", 'North-Eastern University, Gombe', '2024/2025'],
    ["Pro-Chancellor\u2019s Academic Excellence Award (5.00 CGPA)", 'North-Eastern University, Gombe', '2023/2024'],
    ["Pro-Chancellor\u2019s Academic Excellence Award (5.00 CGPA)", 'North-Eastern University, Gombe', '2022/2023'],
    ['Award of Recognition, Student Week \u2013 Lecture Day', 'Student Week Planning Committee, NEU', '2025/2026'],
    ['Recognized for selfless service and contribution', 'NEU Christian Forum', '2026'],
    ['Recognized for contribution to open knowledge', 'Wikimedia Contest Challenge', '2023'],
    ['Annual North-East Tech Fest Competition Winner', 'Illmus Computer College', '\u2014'],
    ['Top 5 Finalist, Kennedy Lugar Youth Exchange Program', 'Evangel College', '\u2014'],
    ['Recognized for outstanding performance in mathematics and science', 'Evangel Inter-Class Mathematics Competition', '\u2014'],
  ].map(([name, issuer, year], i) => ({ name, issuer, year, sort_order: i })),
  contactSubmissions: [],
};

function assignIds(data) {
  ['skills', 'projects', 'experience', 'research', 'certifications', 'awards', 'contactSubmissions'].forEach((key) => {
    data[key].forEach((item, i) => {
      if (item.id === undefined) item.id = i + 1;
    });
  });
  return data;
}

function ensureDb() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(DB_PATH)) {
    const fresh = assignIds(JSON.parse(JSON.stringify(seedData)));
    fs.writeFileSync(DB_PATH, JSON.stringify(fresh, null, 2));
  }
}

function load() {
  ensureDb();
  return JSON.parse(fs.readFileSync(DB_PATH, 'utf-8'));
}

function save(data) {
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
}

// --- Generic collection helpers ---

function nextId(collection) {
  return collection.reduce((max, item) => Math.max(max, item.id || 0), 0) + 1;
}

function listCollection(name) {
  const data = load();
  return [...data[name]].sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));
}

function insertItem(name, fields) {
  const data = load();
  const maxOrder = data[name].reduce((m, i) => Math.max(m, i.sort_order ?? -1), -1);
  const item = { id: nextId(data[name]), ...fields, sort_order: maxOrder + 1 };
  data[name].push(item);
  save(data);
  return item;
}

function updateItem(name, id, patch) {
  const data = load();
  const item = data[name].find((i) => i.id === Number(id));
  if (item) Object.assign(item, patch);
  save(data);
  return item;
}

function deleteItem(name, id) {
  const data = load();
  data[name] = data[name].filter((i) => i.id !== Number(id));
  save(data);
}

function reorderItems(name, orderedIds) {
  const data = load();
  orderedIds.forEach((id, i) => {
    const item = data[name].find((it) => it.id === Number(id));
    if (item) item.sort_order = i;
  });
  save(data);
}

// --- Site info (singleton) ---

function getSiteInfo() {
  return load().siteInfo;
}

function updateSiteInfo(patch) {
  const data = load();
  data.siteInfo = { ...data.siteInfo, ...patch };
  save(data);
  return data.siteInfo;
}

// --- Contact submissions ---

function addSubmission({ name, email, subject, message }) {
  const data = load();
  const submission = {
    id: nextId(data.contactSubmissions),
    name, email, subject, message,
    created_at: new Date().toISOString(),
    is_read: 0,
  };
  data.contactSubmissions.push(submission);
  save(data);
  return submission;
}

function listSubmissions() {
  const data = load();
  return [...data.contactSubmissions].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
}

module.exports = {
  getSiteInfo,
  updateSiteInfo,
  listCollection,
  insertItem,
  updateItem,
  deleteItem,
  reorderItems,
  addSubmission,
  listSubmissions,
  updateItemIn: updateItem, // alias used for contact submissions patch/delete reuse
};
