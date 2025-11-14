# 🏗️ ClipChain Architecture Documentation

## System Overview

ClipChain is a full-stack platform combining modern web technologies with blockchain infrastructure to create an automated podcast clip economy.

```
┌──────────────────────────────────────────────────────────────┐
│                      CLIENT LAYER                             │
│  ┌────────────────┐  ┌────────────────┐  ┌────────────────┐ │
│  │  Next.js App   │  │  React Query   │  │ Framer Motion  │ │
│  │  (Frontend)    │  │  (Data Cache)  │  │  (Animations)  │ │
│  └────────────────┘  └────────────────┘  └────────────────┘ │
└──────────────────────────┬───────────────────────────────────┘
                           │
                           ▼ HTTP/WebSocket
┌──────────────────────────────────────────────────────────────┐
│                     API LAYER                                 │
│  ┌────────────────┐  ┌────────────────┐  ┌────────────────┐ │
│  │  Next.js API   │  │  Express.js    │  │  GraphQL       │ │
│  │  Routes        │  │  (Optional)    │  │  (Optional)    │ │
│  └────────────────┘  └────────────────┘  └────────────────┘ │
└──────────────────────────┬───────────────────────────────────┘
                           │
          ┌────────────────┼────────────────┐
          ▼                ▼                ▼
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│   Database   │  │  Job Queue   │  │   Storage    │
│  PostgreSQL  │  │  Redis+Bull  │  │  IPFS + R2   │
│  (Prisma)    │  │  MQ          │  │              │
└──────────────┘  └──────────────┘  └──────────────┘
                           │
          ┌────────────────┼────────────────┐
          ▼                ▼                ▼
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│  AI Workers  │  │  Blockchain  │  │   Payment    │
│  -Whisper    │  │  Story       │  │   x402       │
│  -Pyannote   │  │  Protocol    │  │              │
│  -LLM        │  │              │  │              │
└──────────────┘  └──────────────┘  └──────────────┘
```

---

## Component Breakdown

### 1. Frontend Architecture

**Technology:** Next.js 15 (App Router), React 18, TypeScript

```
src/
├── app/                    # Next.js 15 app directory
│   ├── page.tsx           # Home page
│   ├── dashboard/         # Dashboard pages
│   ├── clip/[id]/        # Clip detail pages
│   └── api/              # API route handlers
├── components/
│   ├── home/             # Home page components
│   ├── dashboard/        # Dashboard components
│   ├── clip/             # Clip player & editor
│   ├── layout/           # Header, Footer, Nav
│   └── ui/               # shadcn/ui components
├── lib/
│   ├── api.ts            # API client wrapper
│   ├── storyProtocol.ts  # Story Protocol SDK
│   ├── x402.ts           # Payment client
│   └── utils.ts          # Utilities
└── hooks/
    ├── useEpisodes.ts    # Episode data hooks
    ├── useClips.ts       # Clip data hooks
    └── useEarnings.ts    # Earnings hooks
```

**State Management:**
- **Zustand** for global state (user, auth, notifications)
- **React Query** for server state (episodes, clips, earnings)
- **URL state** for filters and pagination

**Key Features:**
- Server-side rendering for SEO
- Optimistic updates for instant UX
- Incremental static regeneration for clip pages
- Real-time updates via WebSocket (earnings, processing status)

---

### 2. Backend Architecture

**Technology:** Next.js API Routes / Express.js, TypeScript, Prisma ORM

```
backend/
├── api/
│   ├── auth/
│   │   ├── login.ts
│   │   ├── logout.ts
│   │   └── wallet-connect.ts
│   ├── episodes/
│   │   ├── create.ts
│   │   ├── list.ts
│   │   ├── [id].ts
│   │   └── process.ts
│   ├── clips/
│   │   ├── list.ts
│   │   ├── [id].ts
│   │   ├── approve.ts
│   │   └── license.ts
│   └── payments/
│       ├── earnings.ts
│       └── withdraw.ts
├── services/
│   ├── storyProtocol.service.ts
│   ├── x402.service.ts
│   ├── ipfs.service.ts
│   └── email.service.ts
├── workers/
│   ├── transcription.worker.ts
│   ├── diarization.worker.ts
│   ├── clipDetection.worker.ts
│   ├── clipGeneration.worker.ts
│   └── ipRegistration.worker.ts
└── prisma/
    ├── schema.prisma
    └── migrations/
```

**Request Flow Example:**

```typescript
// Episode upload flow
POST /api/episodes
  ↓
1. Validate user auth & input
  ↓
2. Upload audio to storage (R2/S3)
  ↓
3. Create Episode record in DB
  ↓
4. Enqueue transcription job (BullMQ)
  ↓
5. Return episode ID to client
  ↓
[Background Processing]
  ↓
6. Transcription worker → Whisper API
  ↓
7. Diarization worker → Pyannote
  ↓
8. Clip detection worker → ML scoring
  ↓
9. Clip generation worker → FFmpeg
  ↓
10. IP registration worker → Story Protocol
  ↓
11. Update DB & notify user (WebSocket/email)
```

---

### 3. Database Schema (Prisma)

**Core Entities:**

```prisma
// User management
model User {
  id            String    @id @default(cuid())
  email         String    @unique
  passwordHash  String?
  walletAddress String?   @unique
  name          String?
  role          Role      @default(CREATOR)
  kycStatus     KYCStatus @default(PENDING)
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  
  episodes      Episode[]
  earnings      Earning[]
}

enum Role {
  CREATOR
  ADMIN
}

enum KYCStatus {
  PENDING
  APPROVED
  REJECTED
}

// Episode management
model Episode {
  id              String   @id @default(cuid())
  userId          String
  title           String
  description     String?
  audioUrl        String
  duration        Int?     // seconds
  transcriptUrl   String?
  transcriptJson  Json?    // structured transcript data
  ipAssetId       String?  @unique
  royaltyHost     Float    @default(70.0)
  royaltyGuest    Float    @default(25.0)
  status          EpisodeStatus @default(PENDING)
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  
  user            User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  clips           Clip[]
  
  @@index([userId, createdAt])
}

enum EpisodeStatus {
  PENDING
  TRANSCRIBING
  PROCESSING
  COMPLETED
  FAILED
}

// Clip management
model Clip {
  id               String   @id @default(cuid())
  episodeId        String
  title            String
  description      String?
  clipUrl          String
  thumbnailUrl     String?
  waveformUrl      String?
  startMs          Int
  endMs            Int
  duration         Int      // milliseconds
  ipAssetId        String?  @unique
  licensePrice     Float    @default(5.0) // USD cents
  tags             String[]
  suggestedCaption String?
  engagementScore  Float?
  approved         Boolean  @default(false)
  createdAt        DateTime @default(now())
  updatedAt        DateTime @updatedAt
  
  episode          Episode  @relation(fields: [episodeId], references: [id], onDelete: Cascade)
  transactions     LicenseTransaction[]
  
  @@index([episodeId])
  @@index([approved, engagementScore])
}

// Licensing & payments
model LicenseTransaction {
  id            String   @id @default(cuid())
  clipId        String
  buyerWallet   String
  amount        Float    // USD cents
  platformFee   Float    // USD cents
  txHash        String   @unique // blockchain transaction hash
  licenseTokenId String? // Story Protocol license token ID
  status        TransactionStatus @default(PENDING)
  createdAt     DateTime @default(now())
  
  clip          Clip     @relation(fields: [clipId], references: [id])
  earnings      Earning[]
  
  @@index([clipId])
  @@index([buyerWallet])
}

enum TransactionStatus {
  PENDING
  COMPLETED
  FAILED
}

// Earnings distribution
model Earning {
  id            String   @id @default(cuid())
  userId        String
  clipId        String?
  transactionId String
  amount        Float    // USD cents
  percentage    Float    // % of transaction
  withdrawn     Boolean  @default(false)
  createdAt     DateTime @default(now())
  
  user          User     @relation(fields: [userId], references: [id])
  transaction   LicenseTransaction @relation(fields: [transactionId], references: [id])
  
  @@index([userId, withdrawn])
}

// Background job tracking
model Job {
  id           String   @id @default(cuid())
  type         JobType
  status       JobStatus @default(QUEUED)
  payload      Json
  result       Json?
  error        String?
  attemptCount Int      @default(0)
  createdAt    DateTime @default(now())
  startedAt    DateTime?
  completedAt  DateTime?
  
  @@index([status, createdAt])
}

enum JobType {
  TRANSCRIPTION
  DIARIZATION
  CLIP_DETECTION
  CLIP_GENERATION
  IP_REGISTRATION
}

enum JobStatus {
  QUEUED
  RUNNING
  COMPLETED
  FAILED
}
```

**Indexes Strategy:**
- Primary indexes on foreign keys (userId, episodeId, clipId)
- Composite index on `clips(approved, engagementScore)` for discovery queries
- Index on `earnings(userId, withdrawn)` for payout queries
- Index on `jobs(status, createdAt)` for worker queue polling

---

### 4. AI Processing Pipeline

#### 4.1 Transcription Worker

```typescript
// workers/transcription.worker.ts
import { createWorker } from 'bullmq';
import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export const transcriptionWorker = createWorker('transcription', async (job) => {
  const { episodeId, audioUrl } = job.data;
  
  // 1. Download audio from storage
  const audioBuffer = await downloadAudio(audioUrl);
  
  // 2. Call Whisper API
  const transcription = await openai.audio.transcriptions.create({
    file: audioBuffer,
    model: 'whisper-1',
    response_format: 'verbose_json',
    timestamp_granularity: ['word'],
  });
  
  // 3. Save transcript
  const transcriptUrl = await uploadToStorage(
    `${episodeId}/transcript.json`,
    JSON.stringify(transcription)
  );
  
  // 4. Update episode
  await prisma.episode.update({
    where: { id: episodeId },
    data: {
      transcriptUrl,
      transcriptJson: transcription,
      status: 'PROCESSING',
    },
  });
  
  // 5. Enqueue next step
  await diarizationQueue.add('diarize', { episodeId });
  
  return { transcriptUrl };
});
```

#### 4.2 Diarization Worker

```typescript
// workers/diarization.worker.ts
import { createWorker } from 'bullmq';
import axios from 'axios';

export const diarizationWorker = createWorker('diarization', async (job) => {
  const { episodeId } = job.data;
  
  const episode = await prisma.episode.findUnique({
    where: { id: episodeId },
  });
  
  // Call Pyannote API or local inference
  const diarization = await axios.post('https://pyannote-api.com/diarize', {
    audio_url: episode.audioUrl,
    num_speakers: 2, // or auto-detect
  });
  
  // Merge with transcript
  const enrichedTranscript = mergeSpeakerLabels(
    episode.transcriptJson,
    diarization.data
  );
  
  await prisma.episode.update({
    where: { id: episodeId },
    data: {
      transcriptJson: enrichedTranscript,
    },
  });
  
  // Enqueue clip detection
  await clipDetectionQueue.add('detect', { episodeId });
});
```

#### 4.3 Clip Detection Worker

**ML-based scoring model:**

```typescript
// workers/clipDetection.worker.ts
interface ClipCandidate {
  startMs: number;
  endMs: number;
  score: number;
  reason: string;
  speakers: string[];
  keywords: string[];
}

export const clipDetectionWorker = createWorker('clip-detection', async (job) => {
  const { episodeId } = job.data;
  const episode = await prisma.episode.findUnique({
    where: { id: episodeId },
  });
  
  const transcript = episode.transcriptJson;
  
  // Scoring heuristics
  const candidates: ClipCandidate[] = [];
  
  // 1. Emotion spike detection (laughter, emphasis)
  const emotionSpikes = detectEmotionSpikes(transcript);
  
  // 2. Topic shift detection (new subject introduced)
  const topicShifts = detectTopicShifts(transcript);
  
  // 3. High information density segments
  const densitySegments = detectInformationDensity(transcript);
  
  // 4. Question-answer pairs
  const qaSegments = detectQAPairs(transcript);
  
  // Combine all signals
  candidates.push(...emotionSpikes, ...topicShifts, ...densitySegments, ...qaSegments);
  
  // Score and rank
  const rankedCandidates = rankCandidates(candidates);
  
  // Take top 5-10 candidates
  const topCandidates = rankedCandidates.slice(0, 8);
  
  // Enqueue clip generation for each
  for (const candidate of topCandidates) {
    await clipGenerationQueue.add('generate', {
      episodeId,
      startMs: candidate.startMs,
      endMs: candidate.endMs,
      score: candidate.score,
    });
  }
});

function detectEmotionSpikes(transcript: any): ClipCandidate[] {
  // Analyze audio features or text sentiment
  // Look for: laughter markers, raised pitch, emphasis
  // Return segments with high emotional engagement
}

function detectTopicShifts(transcript: any): ClipCandidate[] {
  // Use embeddings to detect topic boundaries
  // E.g., cosine similarity between consecutive segments
}

function detectInformationDensity(transcript: any): ClipCandidate[] {
  // Count entities, facts, claims per segment
  // Higher density = more valuable clip
}

function detectQAPairs(transcript: any): ClipCandidate[] {
  // Detect question marks followed by answer patterns
  // Self-contained Q&A makes great clips
}
```

#### 4.4 Clip Generation Worker

```typescript
// workers/clipGeneration.worker.ts
import ffmpeg from 'fluent-ffmpeg';
import sharp from 'sharp';

export const clipGenerationWorker = createWorker('clip-generation', async (job) => {
  const { episodeId, startMs, endMs, score } = job.data;
  
  const episode = await prisma.episode.findUnique({
    where: { id: episodeId },
  });
  
  const clipId = generateClipId();
  const duration = endMs - startMs;
  
  // 1. Extract audio clip
  const clipUrl = await extractAudioClip(
    episode.audioUrl,
    startMs,
    endMs,
    `${episodeId}/${clipId}.mp3`
  );
  
  // 2. Generate thumbnail
  const thumbnailUrl = await generateThumbnail(
    episode.audioUrl,
    startMs,
    `${episodeId}/${clipId}-thumb.jpg`
  );
  
  // 3. Generate waveform visualization
  const waveformUrl = await generateWaveform(
    clipUrl,
    `${episodeId}/${clipId}-waveform.png`
  );
  
  // 4. Generate caption with LLM
  const caption = await generateCaption(
    episode.transcriptJson,
    startMs,
    endMs
  );
  
  // 5. Extract keywords
  const tags = await extractKeywords(caption.text);
  
  // 6. Create clip record
  const clip = await prisma.clip.create({
    data: {
      episodeId,
      title: caption.title,
      description: caption.description,
      clipUrl,
      thumbnailUrl,
      waveformUrl,
      startMs,
      endMs,
      duration,
      tags,
      suggestedCaption: caption.socialText,
      engagementScore: score,
      approved: false,
    },
  });
  
  // 7. Notify creator
  await sendClipReadyNotification(episode.userId, clip.id);
  
  return clip;
});

async function extractAudioClip(sourceUrl: string, startMs: number, endMs: number, outputPath: string) {
  return new Promise((resolve, reject) => {
    ffmpeg(sourceUrl)
      .setStartTime(startMs / 1000)
      .setDuration((endMs - startMs) / 1000)
      .output(outputPath)
      .on('end', () => resolve(outputPath))
      .on('error', reject)
      .run();
  });
}

async function generateCaption(transcript: any, startMs: number, endMs: number) {
  const segment = extractSegment(transcript, startMs, endMs);
  
  const prompt = `
    Generate a captivating title, description, and social media caption for this podcast clip:
    
    Transcript: "${segment}"
    
    Return JSON:
    {
      "title": "...",
      "description": "...",
      "socialText": "...",
      "hashtags": ["...", "..."]
    }
  `;
  
  const completion = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: [{ role: 'user', content: prompt }],
    response_format: { type: 'json_object' },
  });
  
  return JSON.parse(completion.choices[0].message.content);
}
```

---

### 5. Story Protocol Integration

#### 5.1 IP Registration Service

```typescript
// services/storyProtocol.service.ts
import { StoryClient, StoryConfig } from '@story-protocol/core-sdk';
import { uploadJSONToIPFS } from './ipfs.service';

const config: StoryConfig = {
  chainId: process.env.STORY_CHAIN_ID,
  transport: http(process.env.STORY_RPC_URL),
  account: privateKeyToAccount(process.env.STORY_PRIVATE_KEY),
};

const client = StoryClient.newClient(config);

export async function registerEpisodeAsIP(episode: Episode) {
  // 1. Prepare metadata
  const metadata = {
    name: episode.title,
    description: episode.description,
    mediaType: 'audio/mpeg',
    mediaUrl: episode.audioUrl,
    attributes: [
      { trait_type: 'Duration', value: episode.duration },
      { trait_type: 'Creator', value: episode.user.name },
    ],
  };
  
  // 2. Upload to IPFS
  const ipfsHash = await uploadJSONToIPFS(metadata);
  const metadataURI = `ipfs://${ipfsHash}`;
  
  // 3. Register IP Asset
  const response = await client.ipAsset.register({
    nftContract: process.env.SPG_NFT_CONTRACT,
    tokenId: generateTokenId(),
    metadata: {
      metadataURI,
      metadataHash: ipfsHash,
    },
    royalty: {
      royaltyPolicy: process.env.ROYALTY_POLICY_ADDRESS,
      commercialRevShare: 5, // 5% platform fee
    },
  });
  
  // 4. Save IP Asset ID
  await prisma.episode.update({
    where: { id: episode.id },
    data: { ipAssetId: response.ipAssetId },
  });
  
  return response.ipAssetId;
}

export async function registerClipAsDerivative(clip: Clip, parentIpAssetId: string) {
  // 1. Prepare metadata
  const metadata = {
    name: clip.title,
    description: clip.description,
    mediaType: 'audio/mpeg',
    mediaUrl: clip.clipUrl,
    thumbnailUrl: clip.thumbnailUrl,
    parentIpAssetId,
    attributes: [
      { trait_type: 'Duration', value: clip.duration },
      { trait_type: 'Start', value: clip.startMs },
      { trait_type: 'End', value: clip.endMs },
      { trait_type: 'Tags', value: clip.tags.join(', ') },
    ],
  };
  
  const ipfsHash = await uploadJSONToIPFS(metadata);
  
  // 2. Register as derivative
  const response = await client.ipAsset.registerDerivative({
    parentIpIds: [parentIpAssetId],
    licenseTermsIds: [process.env.LICENSE_TERMS_ID],
    nftContract: process.env.SPG_NFT_CONTRACT,
    tokenId: generateTokenId(),
    metadata: {
      metadataURI: `ipfs://${ipfsHash}`,
      metadataHash: ipfsHash,
    },
  });
  
  await prisma.clip.update({
    where: { id: clip.id },
    data: { ipAssetId: response.ipAssetId },
  });
  
  return response.ipAssetId;
}
```

#### 5.2 Licensing Flow

```typescript
// services/licensing.service.ts
export async function purchaseClipLicense(clipId: string, buyerWallet: string) {
  const clip = await prisma.clip.findUnique({
    where: { id: clipId },
    include: { episode: { include: { user: true } } },
  });
  
  // 1. Collect payment via x402
  const payment = await x402Client.createPayment({
    amount: clip.licensePrice,
    currency: 'USDC',
    network: 'base',
    recipient: process.env.BUSINESS_WALLET_ADDRESS,
    metadata: { clipId, buyerWallet },
  });
  
  // 2. Mint license token
  const licenseResponse = await client.license.mintLicenseTokens({
    licensorIpId: clip.ipAssetId,
    licenseTermsId: process.env.LICENSE_TERMS_ID,
    amount: 1,
    receiver: buyerWallet,
  });
  
  // 3. Record transaction
  const transaction = await prisma.licenseTransaction.create({
    data: {
      clipId,
      buyerWallet,
      amount: clip.licensePrice,
      platformFee: clip.licensePrice * 0.05,
      txHash: payment.txHash,
      licenseTokenId: licenseResponse.licenseTokenIds[0],
      status: 'COMPLETED',
    },
  });
  
  // 4. Distribute earnings
  await distributeEarnings(transaction);
  
  return transaction;
}

async function distributeEarnings(transaction: LicenseTransaction) {
  const clip = await prisma.clip.findUnique({
    where: { id: transaction.clipId },
    include: { episode: true },
  });
  
  const totalAmount = transaction.amount - transaction.platformFee;
  
  // Host earnings
  const hostAmount = totalAmount * (clip.episode.royaltyHost / 100);
  await prisma.earning.create({
    data: {
      userId: clip.episode.userId,
      clipId: clip.id,
      transactionId: transaction.id,
      amount: hostAmount,
      percentage: clip.episode.royaltyHost,
    },
  });
  
  // Guest earnings (if applicable)
  if (clip.episode.royaltyGuest > 0) {
    const guestAmount = totalAmount * (clip.episode.royaltyGuest / 100);
    // TODO: Implement guest earning distribution
  }
}
```

---

### 6. Security & Best Practices

**Authentication:**
```typescript
// middleware/auth.ts
import { verify } from 'jsonwebtoken';

export async function authenticate(req: NextRequest) {
  const token = req.headers.get('authorization')?.split(' ')[1];
  
  if (!token) {
    throw new Error('No token provided');
  }
  
  const decoded = verify(token, process.env.JWT_SECRET);
  const user = await prisma.user.findUnique({
    where: { id: decoded.userId },
  });
  
  if (!user) {
    throw new Error('User not found');
  }
  
  return user;
}
```

**Input Validation:**
```typescript
// validation/episode.schema.ts
import { z } from 'zod';

export const createEpisodeSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(5000).optional(),
  audioUrl: z.string().url(),
  royaltyHost: z.number().min(0).max(100).default(70),
  royaltyGuest: z.number().min(0).max(100).default(25),
});
```

**Rate Limiting:**
```typescript
// middleware/rateLimit.ts
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, '10 s'),
});

export async function rateLimit(req: NextRequest) {
  const ip = req.ip ?? '127.0.0.1';
  const { success } = await ratelimit.limit(ip);
  
  if (!success) {
    throw new Error('Rate limit exceeded');
  }
}
```

---

## Performance Optimization

### Caching Strategy

```typescript
// lib/cache.ts
import { Redis } from '@upstash/redis';

const redis = Redis.fromEnv();

export async function getCachedData<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttl: number = 300 // 5 minutes
): Promise<T> {
  const cached = await redis.get(key);
  
  if (cached) {
    return cached as T;
  }
  
  const fresh = await fetcher();
  await redis.set(key, fresh, { ex: ttl });
  
  return fresh;
}
```

### Database Query Optimization

```typescript
// Eager loading with include
const episodes = await prisma.episode.findMany({
  where: { userId: user.id },
  include: {
    clips: {
      where: { approved: true },
      orderBy: { engagementScore: 'desc' },
      take: 5,
    },
  },
});

// Use select to fetch only needed fields
const stats = await prisma.clip.aggregate({
  where: { episodeId: episode.id },
  _count: true,
  _avg: { engagementScore: true },
});
```

---

## Deployment Architecture

```
                    ┌─────────────┐
                    │   Client    │
                    │  (Browser)  │
                    └──────┬──────┘
                           │
                           ▼ HTTPS
                    ┌─────────────┐
                    │   Vercel    │
                    │  (Frontend) │
                    └──────┬──────┘
                           │
           ┌───────────────┼───────────────┐
           ▼               ▼               ▼
    ┌───────────┐   ┌───────────┐   ┌───────────┐
    │   Neon    │   │   Render  │   │ Upstash   │
    │ Postgres  │   │  Backend  │   │   Redis   │
    │  (Main)   │   │   (API)   │   │  (Cache)  │
    └───────────┘   └─────┬─────┘   └───────────┘
                          │
              ┌───────────┼───────────┐
              ▼           ▼           ▼
        ┌──────────┐ ┌──────────┐ ┌──────────┐
        │   R2     │ │  IPFS    │ │  Story   │
        │ Storage  │ │ Pinning  │ │ Protocol │
        └──────────┘ └──────────┘ └──────────┘
```

**Environment Variables:**

```env
# Frontend (.env.local)
NEXT_PUBLIC_API_URL=https://api.clipchain.io
NEXT_PUBLIC_STORY_CHAIN_ID=1513
NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID=...

# Backend (.env)
DATABASE_URL=postgresql://...@neon.tech:5432/clipchain
REDIS_URL=redis://...@upstash.io:6379

STORY_PROTOCOL_API_KEY=...
STORY_RPC_URL=https://rpc.story.foundation
SPG_NFT_CONTRACT=0x...
ROYALTY_POLICY_ADDRESS=0x...
LICENSE_TERMS_ID=1

X402_NETWORK=base
BUSINESS_WALLET_ADDRESS=0x...
X402_PRIVATE_KEY=...

OPENAI_API_KEY=sk-...
WHISPER_API_URL=https://api.openai.com/v1/audio

R2_ACCESS_KEY_ID=...
R2_SECRET_ACCESS_KEY=...
R2_BUCKET_NAME=clipchain-media

IPFS_API_KEY=...
IPFS_API_SECRET=...

JWT_SECRET=...
NEXTAUTH_SECRET=...
```

---

## Monitoring & Observability

```typescript
// lib/monitoring.ts
import * as Sentry from '@sentry/nextjs';
import { trace } from '@opentelemetry/api';

// Error tracking
Sentry.init({
  dsn: process.env.SENTRY_DSN,
  tracesSampleRate: 1.0,
});

// Performance monitoring
export function trackPerformance(name: string, fn: () => Promise<any>) {
  const span = trace.getActiveSpan();
  const childSpan = span?.startSpan(name);
  
  return fn()
    .then((result) => {
      childSpan?.setStatus({ code: 0 });
      return result;
    })
    .catch((error) => {
      childSpan?.setStatus({ code: 2, message: error.message });
      throw error;
    })
    .finally(() => {
      childSpan?.end();
    });
}
```

---

**This architecture provides:**
✅ Scalability via serverless + queue-based processing  
✅ Reliability with retries, idempotency, and error handling  
✅ Security through proper auth, validation, and rate limiting  
✅ Observability with logging, tracing, and monitoring  
✅ Maintainability through clean separation of concerns
