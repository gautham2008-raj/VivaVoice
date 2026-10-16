import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import {
  User,
  Assignment,
  Assessment,
  Review,
} from '../src/types/index.ts';

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

interface DatabaseSchema {
  users: Array<User & { passwordHash: string; salt: string }>;
  sessions: Record<string, string>; // token -> userId
  assignments: Assignment[];
  assessments: Assessment[];
  reviews: Review[];
}

function hashPassword(password: string, salt: string): string {
  return crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
}

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

let dbCache: DatabaseSchema | null = null;

function getInitialDatabase(): DatabaseSchema {
  const teacherSalt = crypto.randomBytes(16).toString('hex');
  const student1Salt = crypto.randomBytes(16).toString('hex');
  const student2Salt = crypto.randomBytes(16).toString('hex');

  const teacher: User & { passwordHash: string; salt: string } = {
    id: 'usr_teacher_1',
    name: 'Prof. Eleanor Vance',
    email: 'teacher@institution.edu',
    role: 'teacher',
    isApprovedTeacher: true,
    createdAt: new Date(Date.now() - 30 * 86400000).toISOString(),
    salt: teacherSalt,
    passwordHash: hashPassword('FacultySecure2026!', teacherSalt),
  };

  const student1: User & { passwordHash: string; salt: string } = {
    id: 'usr_student_alex',
    name: 'Alex Chen',
    email: 'alex.chen@student.edu',
    role: 'student',
    isApprovedTeacher: false,
    createdAt: new Date(Date.now() - 20 * 86400000).toISOString(),
    salt: student1Salt,
    passwordHash: hashPassword('StudentPass2026!', student1Salt),
  };

  const student2: User & { passwordHash: string; salt: string } = {
    id: 'usr_student_maya',
    name: 'Maya Patel',
    email: 'maya.patel@student.edu',
    role: 'student',
    isApprovedTeacher: false,
    createdAt: new Date(Date.now() - 15 * 86400000).toISOString(),
    salt: student2Salt,
    passwordHash: hashPassword('StudentPass2026!', student2Salt),
  };

  // Seed Assignment 1: Alex Chen - Verified
  const assignment1: Assignment = {
    id: 'asgn_alex_distributed',
    studentId: student1.id,
    studentName: student1.name,
    studentEmail: student1.email,
    title: 'Byzantine Consensus & Quorum Slices in Distributed Ledger Networks',
    course: 'CS 482 — Advanced Distributed Systems',
    instructions: 'Analyze consensus mechanisms under adversarial network partitions and evaluate quorum slice overlaps.',
    fileName: 'AlexChen_Byzantine_Consensus_Final.pdf',
    fileSize: 245000,
    fileType: 'application/pdf',
    submissionDate: new Date(Date.now() - 4 * 86400000).toISOString(),
    analysisStatus: 'ready',
    extractedText: `BYZANTINE FAULT TOLERANCE AND QUORUM SLICE OVERLAPS IN ASYNCHRONOUS PROTOCOLS
Alex Chen — Department of Computer Science

ABSTRACT:
Decentralized consensus protocols historically rely on closed-membership Byzantine Fault Tolerance (BFT) mechanisms requiring 3f+1 nodes to tolerate f Byzantine participants. This paper investigates open-membership Federated Byzantine Agreement (FBA) architectures where individual nodes dynamically configure localized Quorum Slices rather than relying on a global consensus validator set. Through empirical simulation across a 128-node heterogeneous network with synthetic packet loss between 5% and 25%, we evaluate the minimum intersection criteria necessary to preserve safety without sacrificing liveness.

1. INTRODUCTION & PROBLEM STATEMENT:
Traditional Practical Byzantine Fault Tolerance (PBFT) suffers from O(N^2) message complexity, rendering it infeasible for wide-area deployment. By contrast, Stellar-style FBA allows each validator v_i to specify a set of quorum slices Q(v_i). A quorum Q is defined as a non-empty set of nodes such that for every member, Q contains at least one of its slices.

2. METHODOLOGY:
We constructed a simulated discrete-event network using Python and SimPy to benchmark commit latencies. Each node was assigned a heterogeneous compute latency (Gaussian mean 12ms, std 4ms). Byzantine nodes exhibited two distinct attack profiles:
Profile A: Equivocation (sending divergent PREPARE messages to distinct peers).
Profile B: Silent crash with intermittent drop.
We measured:
- Time-to-finality (ms)
- Quorum intersection safety threshold
- Message overhead per transaction block.

3. FINDINGS & DISCUSSION:
Results indicate that when quorum intersection exceeds 4f/N + 1, safety is preserved with 99.98% certainty even under 20% adversarial partitioning. However, liveness degrades non-linearly if tier-1 quorum slices lack symmetric peering. As shown in Table 2, the median commit latency remained under 420ms for up to 100 concurrent transactions per second.

4. LIMITATIONS:
Our simulation assumes network latency bounds and did not model dynamic eclipse attacks where adversary nodes saturate all incoming network sockets of honest peers.`,
    analysis: {
      topic: 'Byzantine Consensus and Federated Byzantine Agreement',
      mainArguments: [
        'Open-membership FBA using localized quorum slices outperforms closed 3f+1 BFT in scaling without sacrificing safety.',
        'Symmetric peering in tier-1 quorum slices is critical to prevent liveness deadlocks.',
        'Empirical latency remains sub-500ms even under 20% adversarial packet drop.',
      ],
      keyConcepts: [
        'Federated Byzantine Agreement (FBA)',
        'Quorum Slice Overlap',
        'Safety vs Liveness in Asynchrony',
        'Equivocation Attack Profiles',
        'Discrete-Event Network Simulation',
      ],
      technicalTerms: [
        {
          term: 'Quorum Slice',
          definition: 'A subset of network nodes chosen by a validator to establish agreement.',
          contextInPaper: 'Defined mathematically as Q(v_i) in Section 1.',
        },
        {
          term: 'Equivocation',
          definition: 'A malicious behavior where a node broadcasts contradictory messages to different peers.',
          contextInPaper: 'Modeled as Attack Profile A in Section 2.',
        },
        {
          term: 'Time-to-Finality',
          definition: 'The duration required for a transaction to reach irreversible state confirmation.',
          contextInPaper: 'Measured benchmark variable in Section 3.',
        },
      ],
      methodsAndProcedures: [
        '128-node discrete-event network simulation in SimPy.',
        'Modeled Gaussian heterogeneous compute latency.',
        'Simulated equivocation and silent crash attack profiles.',
      ],
      claimsNeedingExplanation: [
        'Claim that safety is preserved when quorum intersection exceeds 4f/N + 1.',
        'Assertion that message complexity drops while retaining 99.98% safety.',
      ],
      possibleMisconceptions: [
        'Confusing crash-fault tolerance (Raft) with Byzantine tolerance.',
        'Assuming FBA eliminates the need for any quorum intersection.',
      ],
      supportingEvidence: [
        'SimPy empirical simulation benchmark data across 128 nodes.',
        'Table 2 commit latency data (420ms median).',
      ],
      vivaFocusAreas: [
        'Mathematical formulation of the quorum slice intersection condition.',
        'Explanation of why liveness degrades if tier-1 peering is asymmetric.',
        'Impact of the eclipse attack limitation noted in Section 4.',
      ],
    },
  };

  const assessment1: Assessment = {
    id: 'asmt_alex_distributed',
    assignmentId: assignment1.id,
    studentId: student1.id,
    studentName: student1.name,
    assignmentTitle: assignment1.title,
    status: 'evaluated',
    startedAt: new Date(Date.now() - 3 * 86400000).toISOString(),
    completedAt: new Date(Date.now() - 3 * 86400000 + 1800000).toISOString(),
    questions: [
      {
        id: 'q_alex_1',
        order: 1,
        category: 'conceptual',
        questionText: 'Can you explain in your own words how a Quorum Slice differs from a traditional BFT quorum, and why individual nodes configure them independently in FBA?',
        studentAnswer: 'In traditional BFT like PBFT, there is a globally agreed validator list where everyone needs 2f+1 or 3f+1 of the entire system. In FBA, there is no global authority. Instead, each individual node picks which specific peers it trusts to form its own quorum slices. A global quorum only emerges naturally if those individual slices overlap sufficiently.',
        evaluation: {
          conceptualUnderstanding: 4,
          accuracyOfExplanation: 4,
          reasoningJustification: 4,
          applicationAbility: 4,
          consistencyWithSubmission: 4,
          normalizedScore: 96,
          classification: 'correct_well_explained',
          rationale: 'Superb conceptual clarity distinguishing global validator sets from individualized localized trust slices.',
          supportingEvidence: 'Aligns perfectly with Section 1 definitions and mathematics.',
        },
        evaluationGuide: {
          conceptTested: 'Quorum Slice vs Global BFT Quorum',
          keyIdeasExpected: ['No global validator list', 'Localized trust configuration', 'Quorum emergence through overlap'],
          assignmentEvidence: 'Section 1 overview',
          commonMisconceptions: ['Thinking FBA is centralized'],
          scoringRubric: '0-4 points rubric',
        },
      },
      {
        id: 'q_alex_2',
        order: 2,
        category: 'statement_specific',
        questionText: 'In Section 3, you stated that safety is preserved with 99.98% certainty when quorum intersection exceeds 4f/N + 1. Walk me through the mathematical reasoning or simulation data that led you to this threshold.',
        studentAnswer: 'During our SimPy trials with 128 nodes, whenever the overlap between any two quorums was smaller than 4f/N + 1, Byzantine nodes using Profile A (equivocation) could convince disjoint honest subsets to commit conflicting blocks. When the intersection was strictly greater than 4f/N + 1, at least one honest node was guaranteed to be present in both quorums, preventing dual commit.',
        evaluation: {
          conceptualUnderstanding: 4,
          accuracyOfExplanation: 4,
          reasoningJustification: 4,
          applicationAbility: 3,
          consistencyWithSubmission: 4,
          normalizedScore: 94,
          classification: 'correct_well_explained',
          rationale: 'Directly addresses the mathematical mechanism behind the empirical finding in Table 2.',
          supportingEvidence: 'Matches SimPy experimental parameters and equivocation analysis.',
        },
        evaluationGuide: {
          conceptTested: 'Quorum intersection proof & empirical bounds',
          keyIdeasExpected: ['At least one honest node in overlap', 'Prevention of double-commit under equivocation'],
          assignmentEvidence: 'Section 3 Findings',
          commonMisconceptions: ['Quoting numbers without explaining honest node overlap'],
          scoringRubric: '0-4 points rubric',
        },
      },
      {
        id: 'q_alex_3',
        order: 3,
        category: 'methodology',
        questionText: 'Why did you choose discrete-event simulation in SimPy rather than deploying actual Docker containers on a cloud cluster?',
        studentAnswer: 'We wanted deterministic reproducibility for packet drops and millisecond-level scheduling without the non-deterministic jitter of virtualized hypervisors. SimPy let us step through state transitions deterministically and simulate 128 nodes with heterogeneous network delays on a single workstation.',
        evaluation: {
          conceptualUnderstanding: 4,
          accuracyOfExplanation: 4,
          reasoningJustification: 4,
          applicationAbility: 4,
          consistencyWithSubmission: 4,
          normalizedScore: 92,
          classification: 'correct_well_explained',
          rationale: 'Articulates clear engineering justification: determinism, resource efficiency, and precise scheduling control.',
          supportingEvidence: 'Corresponds with Section 2 methodology.',
        },
        evaluationGuide: {
          conceptTested: 'Methodology selection and simulation vs real deployment trade-offs',
          keyIdeasExpected: ['Deterministic reproducibility', 'Scheduling precision', 'Scalability'],
          assignmentEvidence: 'Section 2 Methodology',
          commonMisconceptions: ['Saying SimPy was just easier without technical reasons'],
          scoringRubric: '0-4 points rubric',
        },
      },
    ],
    overallScores: {
      totalScore: 94,
      conceptualUnderstanding: 96,
      accuracy: 94,
      reasoning: 94,
      application: 91,
      consistency: 95,
    },
    understandingReport: {
      summary: 'Student exhibits mastery of distributed consensus principles, clearly defending both the theoretical underpinnings and empirical simulation mechanics.',
      strengths: [
        'Exceptional grasp of localized trust models vs global quorums',
        'Clear mathematical defense of intersection bounds',
        'Thoughtful methodology justification',
      ],
      knowledgeGaps: ['Further exploration into eclipse attack mitigation'],
      demonstratedConcepts: ['FBA Quorum Slices', 'Equivocation Prevention', 'SimPy Simulation Modeling'],
      conceptsNeedingRevision: ['Dynamic Eclipse Attack Surface'],
      areasNeedingClarification: [],
      aiLimitationsNotice: 'This automated evaluation is an instructional tool. Final assessment is verified by the course instructor.',
      suggestedRevisionTopics: ['Network topology partition healing', 'Gossip protocol optimization'],
    },
  };

  const review1: Review = {
    id: 'rev_alex_distributed',
    assignmentId: assignment1.id,
    assessmentId: assessment1.id,
    studentId: student1.id,
    studentName: student1.name,
    studentEmail: student1.email,
    assignmentTitle: assignment1.title,
    course: assignment1.course,
    submissionDate: assignment1.submissionDate,
    understandingScore: 94,
    reviewStatus: 'No Significant Concern Detected',
    inconsistencies: [],
    teacherNotes: 'Excellent viva performance. Alex demonstrated deep spontaneous understanding of the quorum slice mechanics and SimPy execution.',
    teacherDecision: 'Verified Genuine Understanding',
    teacherDecisionDate: new Date(Date.now() - 2 * 86400000).toISOString(),
    teacherName: teacher.name,
  };

  // Seed Assignment 2: Maya Patel - Flagged for Inconsistency
  const assignment2: Assignment = {
    id: 'asgn_maya_crispr',
    studentId: student2.id,
    studentName: student2.name,
    studentEmail: student2.email,
    title: 'High-Fidelity CRISPR-Cas9 Cleavage and Prime Editing in Human Fibroblasts',
    course: 'BIO 310 — Advanced Molecular Genetics',
    instructions: 'Evaluate targeted genome editing efficacy and off-target cleavage reduction using engineered Cas9 variants.',
    fileName: 'MayaPatel_CRISPR_Editing_Report.docx',
    fileSize: 310000,
    fileType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    submissionDate: new Date(Date.now() - 2 * 86400000).toISOString(),
    analysisStatus: 'ready',
    extractedText: `HIGH-FIDELITY CRISPR-CAS9 AND PRIME EDITING FIDELITY IN MAMMALIAN CELL MODELS
Maya Patel — Department of Molecular Biology

ABSTRACT:
While standard SpCas9 mediates double-strand breaks (DSBs) at loci complementary to a 20-nt guide RNA, non-specific binding yields substantial off-target indel generation. In this study, we benchmarked high-fidelity SpCas9-HF1 and eSpCas9(1.1) variants against Prime Editing (PE2/PE3 systems) in HEK293T and human dermal fibroblasts across the HEK site 4 and EMX1 loci. Using targeted deep sequencing and GUIDE-seq, we quantified on-target modification frequencies and off-target cleavage kinetics.

1. INTRODUCTION:
Engineered Cas9 variants incorporate mutating residues involved in non-specific DNA backbone contacts (e.g., N497A, R661A, Q695A, Q926A in SpCas9-HF1) to increase the energetic penalty of guide-target mismatches. Prime editing circumvents double-strand breaks entirely by utilizing an engineered reverse transcriptase fused to a catalytically impaired Cas9 nickase (H840A) and a prime editing guide RNA (pegRNA).

2. METHODOLOGY:
Fibroblasts were electroporated using Neon Transfection System with plasmid constructs encoding:
(a) Wild-type SpCas9 + sgRNA
(b) SpCas9-HF1 + sgRNA
(c) PE3 system (pegRNA containing 13-nt primer binding site and 10-nt reverse transcription template, plus secondary sgRNA nicking the unedited strand).
Cleavage frequency was assessed at 72 hours post-transfection.

3. RESULTS & DISCUSSION:
Wild-type Cas9 generated 42% on-target editing with 11.4% off-target cleavage at homologous genomic loci. SpCas9-HF1 reduced off-target indels below 0.3% while maintaining 36% on-target efficiency. The PE3 prime editing construct demonstrated 31% precise transition without detectable double-strand break translocations, confirming the superiority of reverse-transcriptase-mediated search-and-replace editing.`,
    analysis: {
      topic: 'CRISPR-Cas9 High-Fidelity Variants and Prime Editing Systems',
      mainArguments: [
        'SpCas9-HF1 dramatically suppresses off-target indels by increasing mismatch energetic penalties.',
        'Prime editing eliminates double-strand break liabilities through reverse transcriptase search-and-replace.',
        'PE3 dual-nicking strategy significantly enhances prime editing efficiency in human fibroblasts.',
      ],
      keyConcepts: [
        'SpCas9-HF1 Mutational Mechanism',
        'Prime Editing (pegRNA & Cas9 Nickase H840A)',
        'Off-target Indel Cleavage vs Targeted Transition',
        'GUIDE-seq and Deep Sequencing Validation',
      ],
      technicalTerms: [
        {
          term: 'SpCas9-HF1',
          definition: 'High-fidelity engineered Cas9 variant with four alanine substitutions disrupting DNA backbone contact.',
          contextInPaper: 'Key experimental variant analyzed in Section 1 and 2.',
        },
        {
          term: 'pegRNA',
          definition: 'Prime editing guide RNA specifying both target nicking and containing the RT template.',
          contextInPaper: 'Construct component described in Section 2(c).',
        },
        {
          term: 'Cas9 Nickase (H840A)',
          definition: 'Mutant Cas9 variant that cleaves only one strand of DNA rather than creating double-strand breaks.',
          contextInPaper: 'Core fusion component in prime editing.',
        },
      ],
      methodsAndProcedures: [
        'Neon Transfection System electroporation in human fibroblasts.',
        'Targeted deep sequencing and GUIDE-seq at 72 hours post-transfection.',
        'Comparative benchmarking across SpCas9, SpCas9-HF1, and PE3 systems.',
      ],
      claimsNeedingExplanation: [
        'Claim that SpCas9-HF1 reduced off-target indels below 0.3%.',
        'Assertion that PE3 avoided double-strand break translocations completely.',
      ],
      possibleMisconceptions: [
        'Assuming Cas9 nickase creates double-strand breaks.',
        'Confusing base editing with prime editing.',
      ],
      supportingEvidence: ['On-target vs off-target percentages in Section 3.'],
      vivaFocusAreas: [
        'Mechanism of the H840A nickase in prime editing.',
        'Function of the pegRNA primer binding site (PBS).',
        'Why SpCas9-HF1 requires higher guide RNA complementarity.',
      ],
    },
  };

  const assessment2: Assessment = {
    id: 'asmt_maya_crispr',
    assignmentId: assignment2.id,
    studentId: student2.id,
    studentName: student2.name,
    assignmentTitle: assignment2.title,
    status: 'evaluated',
    startedAt: new Date(Date.now() - 1 * 86400000).toISOString(),
    completedAt: new Date(Date.now() - 1 * 86400000 + 1200000).toISOString(),
    questions: [
      {
        id: 'q_maya_1',
        order: 1,
        category: 'conceptual',
        questionText: 'In your paper, you focus heavily on Prime Editing (PE3). Can you explain how the Cas9 nickase in PE3 operates differently from the wild-type Cas9 you tested?',
        studentAnswer: 'The nickase in prime editing cuts both strands of the DNA very cleanly so the gene can be replaced with a template. It is essentially the same as wild-type Cas9 but faster and more accurate at making double strand cuts.',
        evaluation: {
          conceptualUnderstanding: 1,
          accuracyOfExplanation: 1,
          reasoningJustification: 1,
          applicationAbility: 1,
          consistencyWithSubmission: 1,
          normalizedScore: 28,
          classification: 'misconception',
          rationale: 'Student states that Cas9 nickase cuts both strands and makes double-strand cuts, directly contradicting their submitted paper which emphasized that nickase avoids DSBs entirely.',
          supportingEvidence: 'Section 1 of paper: "Prime editing circumvents double-strand breaks entirely by utilizing an engineered reverse transcriptase fused to a catalytically impaired Cas9 nickase (H840A)..."',
          detectedInconsistency: {
            passageExcerpt: 'Section 1: "Prime editing circumvents double-strand breaks entirely by utilizing an engineered reverse transcriptase fused to a catalytically impaired Cas9 nickase (H840A)"',
            reason: 'Answer states the nickase cuts both strands to create double-strand breaks, directly contradicting the fundamental premise in Section 1.',
            severity: 'high',
          },
        },
        evaluationGuide: {
          conceptTested: 'Cas9 Nickase single-strand cleavage mechanism vs double-strand breaks',
          keyIdeasExpected: ['Nickase only cleaves one strand (single-strand nick)', 'Prevents double-strand break indels and translocations'],
          assignmentEvidence: 'Section 1',
          commonMisconceptions: ['Thinking nickases create double-strand breaks'],
          scoringRubric: '0-4 points rubric',
        },
      },
      {
        id: 'q_maya_2',
        order: 2,
        category: 'statement_specific',
        questionText: 'You wrote that your pegRNA used a 13-nt primer binding site (PBS) and a 10-nt reverse transcription template. How did you choose these exact lengths, and what happens if the PBS is too short?',
        studentAnswer: 'I think that was just the standard setting that came with the lab protocol. If the PBS is short, it probably just doesn’t bind as well, but I don’t recall the exact reason.',
        evaluation: {
          conceptualUnderstanding: 2,
          accuracyOfExplanation: 2,
          reasoningJustification: 1,
          applicationAbility: 1,
          consistencyWithSubmission: 2,
          normalizedScore: 42,
          classification: 'lacks_detail',
          rationale: 'Student exhibits very limited recall regarding the design choices of the pegRNA construct described in detail in Section 2.',
          supportingEvidence: 'Section 2: "pegRNA containing 13-nt primer binding site and 10-nt reverse transcription template"',
        },
        evaluationGuide: {
          conceptTested: 'pegRNA PBS length optimization and primer annealing kinetics',
          keyIdeasExpected: ['PBS hybridization temperature (Tm) matching', 'Preventing self-folding vs ensuring stable annealing'],
          assignmentEvidence: 'Section 2 Methodology',
          commonMisconceptions: ['Unable to explain PBS function'],
          scoringRubric: '0-4 points rubric',
        },
      },
      {
        id: 'q_maya_3',
        order: 3,
        category: 'methodology',
        questionText: 'In Section 1, you listed specific alanine substitutions in SpCas9-HF1 (N497A, R661A, Q695A, Q926A). Why are alanine residues specifically introduced here?',
        studentAnswer: 'Alanine is a very common amino acid in proteins. I am not completely sure why those specific ones were used; it was in the literature references.',
        evaluation: {
          conceptualUnderstanding: 2,
          accuracyOfExplanation: 2,
          reasoningJustification: 1,
          applicationAbility: 2,
          consistencyWithSubmission: 2,
          normalizedScore: 45,
          classification: 'lacks_detail',
          rationale: 'Student cannot explain alanine scanning or disruption of non-specific phosphate backbone hydrogen bonding, despite listing the four residues in the paper.',
          supportingEvidence: 'Section 1: "mutating residues involved in non-specific DNA backbone contacts... to increase the energetic penalty"',
        },
        evaluationGuide: {
          conceptTested: 'Alanine scanning mutagenesis and energetic penalty of mismatch tolerance',
          keyIdeasExpected: ['Alanine removes side-chain interactions without disrupting secondary structure', 'Disrupts non-specific phosphate backbone contacts'],
          assignmentEvidence: 'Section 1',
          commonMisconceptions: ['Thinking alanine is randomly chosen'],
          scoringRubric: '0-4 points rubric',
        },
      },
    ],
    overallScores: {
      totalScore: 38,
      conceptualUnderstanding: 35,
      accuracy: 38,
      reasoning: 30,
      application: 40,
      consistency: 48,
    },
    understandingReport: {
      summary: 'The student exhibits noticeable difficulty explaining core mechanisms documented in the submitted paper, notably conflating single-strand nickases with double-strand break nucleases.',
      strengths: ['Identified broad terminology related to CRISPR and prime editing'],
      knowledgeGaps: [
        'Fundamental distinction between single-strand nicking and double-strand breaks',
        'pegRNA primer binding site thermodynamics and construct design',
        'Structural biochemistry behind alanine mutagenesis in high-fidelity Cas9 variants',
      ],
      demonstratedConcepts: ['General CRISPR vocabulary'],
      conceptsNeedingRevision: ['Prime Editing mechanics', 'Nickase vs Nuclease distinction', 'pegRNA architecture'],
      areasNeedingClarification: ['Actual role of H840A nickase in the PE3 protocol'],
      aiLimitationsNotice: 'This flagged inconsistency is an indicator for educator review. Academic anxiety, unfamiliar phrasing, or rapid typing can affect response quality. The educator must conduct a follow-up interview before reaching any conclusion.',
      suggestedRevisionTopics: ['Genome editing enzymes', 'Prime editing molecular models'],
    },
  };

  const review2: Review = {
    id: 'rev_maya_crispr',
    assignmentId: assignment2.id,
    assessmentId: assessment2.id,
    studentId: student2.id,
    studentName: student2.name,
    studentEmail: student2.email,
    assignmentTitle: assignment2.title,
    course: assignment2.course,
    submissionDate: assignment2.submissionDate,
    understandingScore: 38,
    reviewStatus: 'Flagged for Teacher Review',
    inconsistencies: [
      {
        id: 'inc_maya_1',
        questionAsked: 'In your paper, you focus heavily on Prime Editing (PE3). Can you explain how the Cas9 nickase in PE3 operates differently from the wild-type Cas9 you tested?',
        studentAnswer: 'The nickase in prime editing cuts both strands of the DNA very cleanly so the gene can be replaced with a template. It is essentially the same as wild-type Cas9 but faster and more accurate at making double strand cuts.',
        assignmentPassage: 'Section 1: "Prime editing circumvents double-strand breaks entirely by utilizing an engineered reverse transcriptase fused to a catalytically impaired Cas9 nickase (H840A)..."',
        reasonInconsistent: 'Student asserted the nickase makes double-strand cuts, contradicting the paper’s primary thesis that prime editing circumvents double-strand breaks entirely.',
        confidence: 'High',
        limitations: 'Student could be conceptually confused regarding nuclease vs nickase nomenclature under test pressure.',
        suggestedOralFollowUp: 'Maya, in Section 1 you wrote that prime editing avoids double-strand breaks by using a nickase. Can you draw or describe what a nickase does to the DNA phosphate backbone compared to wild-type Cas9?',
      },
    ],
    teacherNotes: '',
    teacherDecision: 'Pending Review',
  };

  // Seed Assignment 3: Alex Chen - Ready for New Viva
  const assignment3: Assignment = {
    id: 'asgn_alex_macro',
    studentId: student1.id,
    studentName: student1.name,
    studentEmail: student1.email,
    title: 'Macroeconomic Impacts of Quantitative Tightening on Emerging Market Debt',
    course: 'ECON 340 — International Monetary Policy',
    instructions: 'Examine central bank balance sheet contraction and sovereign credit spread widening across Latin America.',
    fileName: 'AlexChen_Macro_QT_Emerging_Markets.pdf',
    fileSize: 185000,
    fileType: 'application/pdf',
    submissionDate: new Date(Date.now() - 10 * 3600000).toISOString(),
    analysisStatus: 'ready',
    extractedText: `QUANTITATIVE TIGHTENING AND SOVEREIGN RISK PREMIA IN EMERGING MARKET ECONOMIES
Alex Chen — Department of Economics

ABSTRACT:
As major central banks transition from balance sheet expansion (Quantitative Easing) to Quantitative Tightening (QT), emerging market economies (EMEs) confront simultaneous pressures of capital flight, domestic currency depreciation, and surging sovereign yield spreads. This empirical inquiry examines panel data spanning 2013-2024 across six Latin American and Southeast Asian sovereigns to estimate the elasticity of foreign-currency-denominated bond spreads relative to Federal Reserve balance sheet runoff rates.

1. THEORETICAL FRAMEWORK:
We employ a modified portfolio balance channel model. In this framework, when the central bank curtails purchases of long-dated domestic sovereign debt, institutional investors rebalance into risk-free domestic securities, draining liquidity from emerging market asset classes. This induces an immediate spike in the Emerging Markets Bond Index (EMBI) spread.

2. EMPIRICAL SPECIFICATION:
Using a fixed-effects vector autoregression (FE-VAR) model, we control for terms-of-trade shocks, commodity price volatility, and domestic policy rate differentials. The core dependent variable is the 10-year sovereign bond yield spread over US Treasuries.

3. KEY FINDINGS:
A $50 billion monthly reduction in Federal Reserve assets correlates with an average 38-basis-point widening in sovereign debt spreads within 90 days. Economies with high short-term external debt-to-reserves ratios exhibit nearly double the sensitivity (68 bps) compared to economies with deep domestic currency debt markets.

4. POLICY IMPLICATIONS & LIMITATIONS:
While central bank swap lines dampen immediate contagion, they do not resolve structural balance-of-payments vulnerability. A limitation of this study is the inability to disentangle concurrent policy rate hikes from pure runoff effects.`,
    analysis: {
      topic: 'Quantitative Tightening and Emerging Market Sovereign Debt Spreads',
      mainArguments: [
        'Fed balance sheet runoff triggers portfolio rebalancing out of emerging market debt via the portfolio balance channel.',
        'A $50B monthly QT pace induces a 38-basis-point widening in sovereign spreads on average.',
        'Domestic debt depth and high FX reserve ratios serve as primary macroeconomic shock absorbers.',
      ],
      keyConcepts: [
        'Portfolio Balance Channel',
        'Emerging Markets Bond Index (EMBI) Spread',
        'Fixed-Effects Vector Autoregression (FE-VAR)',
        'External Debt-to-Reserves Elasticity',
        'Central Bank Liquidity Contagion',
      ],
      technicalTerms: [
        {
          term: 'Portfolio Balance Channel',
          definition: 'Mechanism where central bank asset purchases/sales alter relative asset supplies, forcing investors to rebalance portfolios.',
          contextInPaper: 'Section 1 theoretical anchor.',
        },
        {
          term: 'EMBI Spread',
          definition: 'The difference between yield on sovereign bonds and benchmark US Treasuries.',
          contextInPaper: 'Section 2 dependent variable.',
        },
        {
          term: 'Runoff Rate',
          definition: 'The pace at which maturing central bank securities expire without reinvestment.',
          contextInPaper: 'Section 3 regression independent variable.',
        },
      ],
      methodsAndProcedures: [
        'Fixed-effects vector autoregression (FE-VAR) on panel data (2013-2024).',
        'Controlled for commodity volatility, terms-of-trade, and policy rate differentials.',
        'Elasticity calculation for short-term external debt ratios.',
      ],
      claimsNeedingExplanation: [
        'Claim of 38-basis-point spread widening per $50B runoff.',
        'Distinction between interest rate hikes and pure runoff effects.',
      ],
      possibleMisconceptions: [
        'Equating Quantitative Tightening with conventional interest rate adjustments.',
        'Assuming all emerging markets share identical debt risk profiles.',
      ],
      supportingEvidence: ['FE-VAR regression tables across Latin American panel.'],
      vivaFocusAreas: [
        'Mechanism of the portfolio balance channel.',
        'How the study attempted to separate policy rates from balance sheet runoff.',
        'Why external debt-to-reserves ratio doubled sensitivity.',
      ],
    },
  };

  const assessment3: Assessment = {
    id: 'asmt_alex_macro',
    assignmentId: assignment3.id,
    studentId: student1.id,
    studentName: student1.name,
    assignmentTitle: assignment3.title,
    status: 'not_started',
    questions: [
      {
        id: 'q_macro_1',
        order: 1,
        category: 'conceptual',
        questionText: 'Can you explain the portfolio balance channel described in Section 1, and why it causes capital to pull back from emerging markets during Quantitative Tightening?',
        evaluationGuide: {
          conceptTested: 'Portfolio balance channel transmission mechanism',
          keyIdeasExpected: ['Central bank sells or rolls off safe assets', 'Domestic investors absorb safe yield', 'Reduced demand for high-yield emerging debt'],
          assignmentEvidence: 'Section 1 Theoretical Framework',
          commonMisconceptions: ['Attributing everything solely to exchange rates without portfolio supply shifts'],
          scoringRubric: '0-4 points rubric',
        },
      },
      {
        id: 'q_macro_2',
        order: 2,
        category: 'statement_specific',
        questionText: 'In Section 3, you reported that economies with high short-term external debt-to-reserves ratios exhibited nearly double the spread widening (68 bps vs 38 bps). What economic rationale explains this elevated vulnerability?',
        evaluationGuide: {
          conceptTested: 'Rollover risk and foreign exchange reserve adequacy',
          keyIdeasExpected: ['Need to refinance maturing dollar debt at higher rates', 'Risk of foreign exchange reserves depletion'],
          assignmentEvidence: 'Section 3 Findings',
          commonMisconceptions: ['Confusing domestic debt with foreign-currency external debt'],
          scoringRubric: '0-4 points rubric',
        },
      },
      {
        id: 'q_macro_3',
        order: 3,
        category: 'methodology',
        questionText: 'In your limitations, you acknowledged the difficulty of disentangling interest rate hikes from balance sheet runoff. How did your FE-VAR attempt to isolate these two simultaneous monetary policies?',
        evaluationGuide: {
          conceptTested: 'Econometric identification and control variables in FE-VAR',
          keyIdeasExpected: ['Inclusion of policy rate differentials as explicit controls', 'Lagged impulse response functions'],
          assignmentEvidence: 'Section 2 Empirical Specification & Section 4 Limitations',
          commonMisconceptions: ['Claiming the model separated them with 100% perfection'],
          scoringRubric: '0-4 points rubric',
        },
      },
      {
        id: 'q_macro_4',
        order: 4,
        category: 'application',
        questionText: 'If an emerging market sovereign wanted to proactively buffer itself against future balance sheet contraction by the Fed, what specific domestic debt management strategy would your paper recommend?',
        evaluationGuide: {
          conceptTested: 'Policy translation and debt market development',
          keyIdeasExpected: ['Issuing local-currency denominated bonds', 'Extending debt maturity profile', 'Building foreign exchange reserve buffers'],
          assignmentEvidence: 'Section 4 Policy Implications',
          commonMisconceptions: ['Suggesting the country take on more short-term dollar loans'],
          scoringRubric: '0-4 points rubric',
        },
      },
    ],
  };

  return {
    users: [teacher, student1, student2],
    sessions: {},
    assignments: [assignment1, assignment2, assignment3],
    assessments: [assessment1, assessment2, assessment3],
    reviews: [review1, review2],
  };
}

export function loadDatabase(): DatabaseSchema {
  if (dbCache) {
    return dbCache;
  }

  try {
    if (fs.existsSync(DB_FILE)) {
      const raw = fs.readFileSync(DB_FILE, 'utf-8');
      dbCache = JSON.parse(raw);
      return dbCache!;
    }
  } catch (err) {
    console.error('Error reading database file, initializing defaults:', err);
  }

  const initial = getInitialDatabase();
  saveDatabase(initial);
  dbCache = initial;
  return dbCache;
}

export function saveDatabase(data?: DatabaseSchema) {
  const toSave = data || dbCache;
  if (!toSave) return;
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(toSave, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to save database file:', err);
  }
}

// ================= Auth Operations =================

export function authenticateUser(email: string, password: string): { user: User; token: string } | null {
  const db = loadDatabase();
  const normalizedEmail = email.trim().toLowerCase();
  const found = db.users.find((u) => u.email.toLowerCase() === normalizedEmail);

  if (!found) return null;

  const testHash = hashPassword(password, found.salt);
  if (testHash !== found.passwordHash) {
    return null;
  }

  const token = `tok_${crypto.randomBytes(24).toString('hex')}`;
  db.sessions[token] = found.id;
  saveDatabase();

  const { passwordHash, salt, ...safeUser } = found;
  return { user: safeUser, token };
}

export function registerUser(
  name: string,
  email: string,
  password: string,
  role: 'student' | 'teacher',
  facultyPasscode?: string
): { user: User; token: string } {
  const db = loadDatabase();
  const normalizedEmail = email.trim().toLowerCase();

  const existing = db.users.find((u) => u.email.toLowerCase() === normalizedEmail);
  if (existing) {
    throw new Error('An account with this email address already exists.');
  }

  // Teacher security requirement:
  // Do not allow anyone to get teacher privileges simply by selecting "Teacher".
  // Requires faculty passcode "FACULTY2026" or explicit authorization.
  let isApprovedTeacher = false;
  let finalRole = role;

  if (role === 'teacher') {
    if (facultyPasscode === 'FACULTY2026' || facultyPasscode === 'VIVA_FACULTY_2026') {
      isApprovedTeacher = true;
    } else {
      // Default to student role or unapproved teacher
      finalRole = 'student';
      isApprovedTeacher = false;
    }
  }

  const salt = crypto.randomBytes(16).toString('hex');
  const passwordHash = hashPassword(password, salt);

  const newUser: User & { passwordHash: string; salt: string } = {
    id: `usr_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    name: name.trim(),
    email: normalizedEmail,
    role: finalRole,
    isApprovedTeacher,
    createdAt: new Date().toISOString(),
    salt,
    passwordHash,
  };

  db.users.push(newUser);
  const token = `tok_${crypto.randomBytes(24).toString('hex')}`;
  db.sessions[token] = newUser.id;
  saveDatabase();

  const { passwordHash: _, salt: __, ...safeUser } = newUser;
  return { user: safeUser, token };
}

export function getUserByToken(token: string): User | null {
  const db = loadDatabase();
  const userId = db.sessions[token];
  if (!userId) return null;

  const user = db.users.find((u) => u.id === userId);
  if (!user) return null;

  const { passwordHash, salt, ...safeUser } = user;
  return safeUser;
}

export function logoutUser(token: string): boolean {
  const db = loadDatabase();
  if (db.sessions[token]) {
    delete db.sessions[token];
    saveDatabase();
    return true;
  }
  return false;
}

// ================= Assignment & Assessment Operations =================

export function getAssignments(userId?: string, isTeacher: boolean = false): Assignment[] {
  const db = loadDatabase();
  if (isTeacher) {
    return [...db.assignments].sort(
      (a, b) => new Date(b.submissionDate).getTime() - new Date(a.submissionDate).getTime()
    );
  }
  return db.assignments
    .filter((a) => a.studentId === userId)
    .sort((a, b) => new Date(b.submissionDate).getTime() - new Date(a.submissionDate).getTime());
}

export function getAssignmentById(id: string): Assignment | null {
  const db = loadDatabase();
  return db.assignments.find((a) => a.id === id) || null;
}

export function saveAssignment(assignment: Assignment): void {
  const db = loadDatabase();
  const idx = db.assignments.findIndex((a) => a.id === assignment.id);
  if (idx >= 0) {
    db.assignments[idx] = assignment;
  } else {
    db.assignments.push(assignment);
  }
  saveDatabase();
}

export function getAssessmentById(id: string): Assessment | null {
  const db = loadDatabase();
  return db.assessments.find((a) => a.id === id) || null;
}

export function getAssessmentByAssignmentId(assignmentId: string): Assessment | null {
  const db = loadDatabase();
  return db.assessments.find((a) => a.assignmentId === assignmentId) || null;
}

export function saveAssessment(assessment: Assessment): void {
  const db = loadDatabase();
  const idx = db.assessments.findIndex((a) => a.id === assessment.id);
  if (idx >= 0) {
    db.assessments[idx] = assessment;
  } else {
    db.assessments.push(assessment);
  }
  saveDatabase();
}

// ================= Review Operations =================

export function getReviews(): Review[] {
  const db = loadDatabase();
  return [...db.reviews].sort(
    (a, b) => new Date(b.submissionDate).getTime() - new Date(a.submissionDate).getTime()
  );
}

export function getReviewById(id: string): Review | null {
  const db = loadDatabase();
  return db.reviews.find((r) => r.id === id) || null;
}

export function getReviewByAssignmentId(assignmentId: string): Review | null {
  const db = loadDatabase();
  return db.reviews.find((r) => r.id === assignmentId || r.assignmentId === assignmentId) || null;
}

export function saveReview(review: Review): void {
  const db = loadDatabase();
  const idx = db.reviews.findIndex((r) => r.id === review.id);
  if (idx >= 0) {
    db.reviews[idx] = review;
  } else {
    db.reviews.push(review);
  }
  saveDatabase();
}
