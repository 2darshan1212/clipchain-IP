# 🎙️ ClipChain - Podcast Clip Economy Platform

> Turn your podcast episodes into licensed IP assets. Every clip earns royalties automatically.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Story Protocol](https://img.shields.io/badge/Powered%20by-Story%20Protocol-blue)](https://www.story.foundation/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue)](https://www.typescriptlang.org/)

## 🌟 Overview

ClipChain is a revolutionary platform that transforms the podcast economy by:

- **Registering episodes as IP assets** on Story Protocol blockchain
- **Auto-generating high-quality clips** using advanced AI (transcription, diarization, clip detection)
- **Licensing clips automatically** with micropayment royalties (via x402)
- **Splitting revenue** automatically between hosts, guests, and platform

Every time someone uses your clip, you earn. It's that simple.

---

## 🚀 Key Features

### For Creators

- ✨ **One-Click Upload** - Drop audio files or import via YouTube URL
- 🤖 **AI Clip Generation** - Automatically detect and extract high-value moments (30-90s clips)
- 📝 **Smart Transcription** - Whisper-powered transcription with speaker diarization
- 💰 **Automatic Royalties** - Earn every time your clips are licensed
- 📊 **Creator Dashboard** - Track earnings, analytics, and manage your content
- ✂️ **Clip Editor** - Fine-tune AI suggestions with waveform scrubbing and trim tools

### For Users

- 🔍 **Browse Clip Library** - Discover engaging podcast moments
- 💳 **Easy Licensing** - One-click to license clips for social media or projects
- ⛓️ **On-Chain Tracking** - All licenses recorded on Story Protocol blockchain
- 🎯 **Fair Pricing** - Transparent micropayments with x402

### Technical Infrastructure

- 🛡️ **Story Protocol Integration** - IP registration, derivative tracking, and royalty distribution
- ⚡ **AI Pipeline** - Transcription → Diarization → Clip Detection → Generation
- 💳 **x402 Micropayments** - Seamless payment processing on Base network
- 📦 **IPFS Storage** - Decentralized metadata storage
- 🔐 **Secure Auth** - OAuth + Wallet connect with optional KYC

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Frontend (Next.js)                    │
│  - React UI with shadcn/ui components                       │
│  - Zustand state management                                 │
│  - React Query for data fetching                            │
│  - Framer Motion animations                                 │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│                    Backend (Next.js API Routes)              │
│  - TypeScript + Prisma ORM                                  │
│  - PostgreSQL (Neon) + Redis (Upstash)                     │
│  - BullMQ for job queues                                    │
└────────────────────┬────────────────────────────────────────┘
                     │
      ┌──────────────┼──────────────┐
      ▼              ▼              ▼
┌──────────┐  ┌──────────┐  ┌──────────┐
│   Story  │  │    AI    │  │  Media   │
│ Protocol │  │ Workers  │  │ Storage  │
│          │  │          │  │          │
│ - IP Reg │  │ -Whisper │  │ - IPFS   │
│ -License │  │ -Pyannote│  │ - R2/S3  │
│ -Royalty │  │ -Scoring │  │ - FFmpeg │
└──────────┘  └──────────┘  └──────────┘
```

---

## 📋 Tech Stack

### Frontend
- **Framework:** Next.js 15 (App Router) + TypeScript
- **UI:** Tailwind CSS + shadcn/ui
- **State:** Zustand
- **Data Fetching:** React Query (TanStack)
- **Animations:** Framer Motion

### Backend
- **Runtime:** Node.js + TypeScript
- **Database:** PostgreSQL (Neon) with Prisma ORM
- **Cache/Queue:** Redis (Upstash) + BullMQ
- **Media Processing:** FFmpeg CLI

### AI & Media
- **Transcription:** Whisper (OpenAI or open-source)
- **Diarization:** Pyannote or similar
- **LLM:** Llama / OpenAI for captions & tags
- **Storage:** Supabase Storage / Cloudflare R2 / IPFS

### Blockchain & Payments
- **IP Protocol:** Story Protocol SDK
- **Payments:** x402 micropayments (Base network)
- **Metadata:** IPFS (Web3.storage / nft.storage)

### DevOps
- **Containerization:** Docker + Docker Compose
- **CI/CD:** GitHub Actions
- **Hosting:** Vercel (frontend) + Render/Neon (backend)

---

## 🗄️ Database Schema

### Core Models

```prisma
model User {
  id            String    @id @default(cuid())
  email         String    @unique
  name          String?
  walletAddress String?   @unique
  role          Role      @default(CREATOR)
  kycStatus     KYCStatus @default(PENDING)
  createdAt     DateTime  @default(now())
  
  episodes      Episode[]
  earnings      Earning[]
}

model Episode {
  id            String   @id @default(cuid())
  userId        String
  title         String
  description   String?
  audioUrl      String
  transcriptUrl String?
  ipAssetId     String?  @unique // Story Protocol IP Asset ID
  royaltyHost   Float    @default(70.0)
  royaltyGuest  Float    @default(25.0)
  status        Status   @default(PENDING)
  createdAt     DateTime @default(now())
  
  user          User     @relation(fields: [userId], references: [id])
  clips         Clip[]
}

model Clip {
  id               String   @id @default(cuid())
  episodeId        String
  title            String
  clipUrl          String
  thumbnailUrl     String?
  startMs          Int
  endMs            Int
  ipAssetId        String?  @unique // Story Protocol derivative asset
  licensePrice     Float    @default(5.0) // USD cents
  tags             String[]
  engagementScore  Float?
  createdAt        DateTime @default(now())
  
  episode          Episode  @relation(fields: [episodeId], references: [id])
  transactions     LicenseTransaction[]
}

model LicenseTransaction {
  id            String   @id @default(cuid())
  clipId        String
  buyerWallet   String
  amount        Float
  platformFee   Float
  txHash        String   @unique
  createdAt     DateTime @default(now())
  
  clip          Clip     @relation(fields: [clipId], references: [id])
  earnings      Earning[]
}

model Earning {
  id            String   @id @default(cuid())
  userId        String
  clipId        String?
  transactionId String
  amount        Float
  percentage    Float
  createdAt     DateTime @default(now())
  
  user          User     @relation(fields: [userId], references: [id])
  transaction   LicenseTransaction @relation(fields: [transactionId], references: [id])
}
```

---

## 🔌 API Endpoints

### Authentication
```typescript
POST /api/auth/login              // Email + password login
POST /api/auth/wallet-connect     // Wallet signature auth
POST /api/auth/logout             // Sign out
```

### Episodes
```typescript
POST   /api/episodes              // Upload episode metadata
GET    /api/episodes              // List user's episodes
GET    /api/episodes/:id          // Get episode details
POST   /api/episodes/:id/process  // Trigger AI processing
DELETE /api/episodes/:id          // Delete episode
```

### Clips
```typescript
GET    /api/clips                 // Browse all clips (paginated)
GET    /api/clips/:id             // Get clip details
POST   /api/clips/:id/approve     // Creator approves AI clip
POST   /api/clips/:id/license     // Purchase license & trigger payment
PUT    /api/clips/:id             // Update clip metadata
DELETE /api/clips/:id             // Delete clip
```

### Licensing & Payments
```typescript
POST   /api/licenses/purchase     // Initiate license purchase
GET    /api/earnings               // Get user earnings
POST   /api/payouts/withdraw      // Request payout
GET    /api/transactions          // List transactions
```

### Admin
```typescript
POST   /api/admin/reprocess       // Re-run processing for episode
GET    /api/admin/audit-logs      // View system logs
GET    /api/admin/stats           // Platform statistics
```

---

## 🤖 AI Processing Pipeline

### 1. Transcription Worker
- **Input:** Episode audio URL
- **Process:** Run Whisper model → generate JSON + SRT with timestamps
- **Output:** Save transcript to DB + storage

### 2. Diarization Worker
- **Input:** Transcript + audio
- **Process:** Use pyannote or similar → label speakers with timestamps
- **Output:** Speaker-timestamp map

### 3. Clip Candidate Detection
- **Input:** Transcript + diarization data
- **Process:** ML-based scoring (emotion spikes, topic shifts, engagement heuristics)
- **Output:** List of high-value clip candidates with scores

### 4. Clip Generation Worker
- **Input:** Clip candidates
- **Process:** 
  - Extract audio/video segments via FFmpeg
  - Generate thumbnails (16:9 + 9:16 for social)
  - Create captions (SRT + WebVTT)
  - Generate suggested hashtags/captions via LLM
- **Output:** Ready-to-use clip assets

### 5. IP Registration Worker
- **Input:** Episode/Clip metadata
- **Process:**
  - Create metadata JSON
  - Upload to IPFS
  - Call Story Protocol SDK to register asset
- **Output:** `ipAssetId` stored in database

### 6. License Minting Flow
- **Trigger:** User purchases license
- **Process:**
  - Collect payment via x402
  - Mint license token on Story Protocol
  - Calculate + distribute royalties
- **Output:** License transaction recorded on-chain

---

## 🔗 Story Protocol Integration

### Register Episode as IP Asset
```typescript
import { StoryClient } from '@story-protocol/core-sdk';

const storyClient = new StoryClient({ /* config */ });

async function registerEpisode(episodeMetadata: EpisodeMetadata) {
  // Upload metadata to IPFS
  const ipfsHash = await uploadToIPFS(episodeMetadata);
  
  // Register as IP Asset
  const result = await storyClient.ipAsset.register({
    nftContract: SPG_NFT_CONTRACT,
    tokenId: generateTokenId(),
    metadata: {
      metadataURI: `ipfs://${ipfsHash}`,
      metadataHash: ipfsHash,
    },
    royalty: {
      royaltyPolicy: ROYALTY_POLICY_ADDRESS,
      mintingFee: 0,
      commercialRevShare: 10, // 10% platform fee
    },
  });
  
  return result.ipAssetId;
}
```

### Register Clip as Derivative
```typescript
async function registerClip(clipMetadata: ClipMetadata, parentAssetId: string) {
  const ipfsHash = await uploadToIPFS(clipMetadata);
  
  const result = await storyClient.ipAsset.registerDerivative({
    parentIpIds: [parentAssetId],
    licenseTermsIds: [LICENSE_TERMS_ID],
    nftContract: SPG_NFT_CONTRACT,
    tokenId: generateTokenId(),
    metadata: {
      metadataURI: `ipfs://${ipfsHash}`,
      metadataHash: ipfsHash,
    },
  });
  
  return result.ipAssetId;
}
```

### Mint License & Collect Payment
```typescript
import { x402 } from 'x402';

async function purchaseLicense(clipId: string, buyerWallet: string) {
  const clip = await getClip(clipId);
  
  // Collect payment via x402
  const payment = await x402.createPayment({
    amount: clip.licensePrice,
    currency: 'USDC',
    network: 'base',
    recipient: BUSINESS_WALLET_ADDRESS,
    metadata: { clipId, buyerWallet },
  });
  
  // Mint license token
  const license = await storyClient.license.mintLicenseTokens({
    licensorIpId: clip.ipAssetId,
    licenseTermsId: LICENSE_TERMS_ID,
    amount: 1,
    receiver: buyerWallet,
  });
  
  // Distribute royalties
  await distributeRoyalties(clip, payment.amount);
  
  return { licenseId: license.licenseTokenIds[0], txHash: payment.txHash };
}
```

---

## 💰 Revenue Model

### Pricing
- **Free Tier:** 3 episodes/month, basic clips
- **Creator Plan:** $29/month - unlimited episodes, advanced AI
- **Pro Plan:** $99/month - priority processing, white-label options
- **License Fees:** $0.05 - $5.00 per clip use (set by creator)

### Revenue Split (per license)
- **Host:** 70% (configurable)
- **Guest:** 25% (configurable)
- **Platform:** 5% (fixed)

### Projected Revenue (Year 1)
- **Target Users:** 10,000 creators
- **Avg Episodes/Creator:** 12/year → 120,000 episodes
- **Avg Clips/Episode:** 5 → 600,000 clips
- **Avg License Price:** $2.00
- **License Conversion:** 10% clips licensed → 60,000 transactions
- **Total Transaction Volume:** $120,000/year
- **Platform Fee (5%):** $6,000/year
- **Subscription Revenue:** 10,000 creators × $29/mo avg × 12 = $3.48M/year
- **Total Year 1 Revenue:** ~$3.5M

---

## 🎯 Market & Competition

### Target Market
- **Primary:** Independent podcasters (50K+ monthly downloads)
- **Secondary:** Podcast networks & agencies
- **Tertiary:** Audio creators (audiobooks, courses)

### Competitive Advantage
1. **Only platform with blockchain IP registration** - true ownership
2. **Automated royalty distribution** - no manual accounting
3. **AI-first approach** - zero manual editing
4. **Micropayment infrastructure** - fair compensation per use

### Competitors
| Platform | IP Ownership | AI Clips | Royalties | Our Advantage |
|----------|--------------|----------|-----------|---------------|
| Descript | ❌ | ✅ | ❌ | Blockchain + royalties |
| Riverside.fm | ❌ | ✅ | ❌ | Automated licensing |
| Headliner | ❌ | ❌ | ❌ | Full AI + IP ownership |

---

## 📈 Growth Strategy

### Phase 1: MVP (Months 1-3)
- ✅ Core upload + AI pipeline
- ✅ Story Protocol integration
- ✅ Basic dashboard
- 🎯 Target: 100 beta creators

### Phase 2: Scale (Months 4-6)
- 📊 Advanced analytics
- 🎨 Social media integrations
- 🤝 Partnership program
- 🎯 Target: 1,000 creators

### Phase 3: Expansion (Months 7-12)
- 🌍 Multi-language support
- 📱 Mobile apps (iOS/Android)
- 🎬 Video podcast support
- 🎯 Target: 10,000 creators

### Future Vision (Year 2+)
- 🤖 AI co-host generation
- 🎭 Voice cloning for clips
- 📺 Podcast streaming platform
- 🌐 DAO governance model

---

## 🛠️ Development Setup

### Prerequisites
- Node.js 18+
- PostgreSQL
- Redis
- FFmpeg
- Docker (optional)

### Installation

```bash
# Clone repository
git clone https://github.com/yourusername/clipchain.git
cd clipchain

# Install dependencies
npm install

# Setup environment variables
cp .env.example .env
# Edit .env with your credentials

# Setup database
npx prisma migrate dev
npx prisma generate

# Start development server
npm run dev
```

### Environment Variables

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/clipchain"
REDIS_URL="redis://localhost:6379"

# Story Protocol
STORY_PROTOCOL_API_KEY="your_story_api_key"
STORY_NETWORK="sepolia" # or "mainnet"
SPG_NFT_CONTRACT="0x..."
ROYALTY_POLICY_ADDRESS="0x..."

# x402 Payments
X402_NETWORK="base-sepolia"
BUSINESS_WALLET_ADDRESS="0x..."
X402_PRIVATE_KEY="your_private_key"

# AI Services
OPENAI_API_KEY="sk-..."
WHISPER_API_URL="https://api.openai.com/v1/audio"

# Storage
IPFS_API_KEY="your_ipfs_key"
R2_ACCESS_KEY="your_r2_key"
R2_SECRET_KEY="your_r2_secret"

# Auth
JWT_SECRET="your_jwt_secret"
NEXTAUTH_SECRET="your_nextauth_secret"
```

### Running Workers

```bash
# Start transcription worker
npm run worker:transcription

# Start diarization worker
npm run worker:diarization

# Start clip generation worker
npm run worker:clips

# Start IP registration worker
npm run worker:ip-registration

# Or run all workers
npm run workers:all
```

### Docker Setup (Recommended)

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

---

## 🧪 Testing

```bash
# Run unit tests
npm run test

# Run integration tests
npm run test:integration

# Run E2E tests
npm run test:e2e

# Generate coverage report
npm run test:coverage
```

---

## 📚 Documentation

- [API Reference](./docs/API.md)
- [Story Protocol Integration](./docs/STORY_PROTOCOL.md)
- [AI Pipeline Guide](./docs/AI_PIPELINE.md)
- [Deployment Guide](./docs/DEPLOYMENT.md)
- [Contributing Guidelines](./CONTRIBUTING.md)

---

## 🤝 Contributing

We welcome contributions! Please read our [Contributing Guidelines](./CONTRIBUTING.md) first.

### Development Process
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.

---

## 🙏 Acknowledgments

- **Story Protocol** - For pioneering blockchain IP infrastructure
- **Coinbase** - For x402 micropayments protocol
- **OpenAI** - For Whisper transcription
- **Pyannote** - For speaker diarization

---

## 📞 Support & Contact

- **Website:** [clipchain.io](https://clipchain.io)
- **Email:** support@clipchain.io
- **Discord:** [Join our community](https://discord.gg/clipchain)
- **Twitter:** [@clipchain](https://twitter.com/clipchain)

---

**Built with ❤️ by the ClipChain team**

*Empowering creators through blockchain IP and AI automation*
