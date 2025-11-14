# 🔗 ClipChain Integration Guide

## Story Protocol Integration

### Prerequisites

```bash
npm install @story-protocol/core-sdk viem
```

### 1. Setup Story Protocol Client

```typescript
// lib/storyProtocol.ts
import { StoryClient, StoryConfig } from '@story-protocol/core-sdk';
import { http } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';

const config: StoryConfig = {
  chainId: Number(process.env.STORY_CHAIN_ID), // 1513 for mainnet
  transport: http(process.env.STORY_RPC_URL),
  account: privateKeyToAccount(process.env.STORY_PRIVATE_KEY as `0x${string}`),
};

export const storyClient = StoryClient.newClient(config);
```

### 2. Register Episode as IP Asset

```typescript
import { storyClient } from '@/lib/storyProtocol';
import { uploadJSONToIPFS } from '@/lib/ipfs';

export async function registerEpisodeAsIP(episode: {
  id: string;
  title: string;
  description: string;
  audioUrl: string;
  duration: number;
  creator: string;
}) {
  // 1. Prepare metadata
  const metadata = {
    name: episode.title,
    description: episode.description,
    mediaType: 'audio/mpeg',
    mediaUrl: episode.audioUrl,
    external_url: `https://clipchain.io/episode/${episode.id}`,
    attributes: [
      { trait_type: 'Duration', value: episode.duration },
      { trait_type: 'Creator', value: episode.creator },
      { trait_type: 'Type', value: 'Podcast Episode' },
    ],
  };

  // 2. Upload to IPFS
  const ipfsHash = await uploadJSONToIPFS(metadata);
  const metadataURI = `ipfs://${ipfsHash}`;

  // 3. Register as IP Asset
  const response = await storyClient.ipAsset.register({
    nftContract: process.env.SPG_NFT_CONTRACT as `0x${string}`,
    tokenId: BigInt(generateTokenId()),
    metadata: {
      metadataURI,
      metadataHash: ipfsHash,
    },
    royalty: {
      royaltyPolicy: process.env.ROYALTY_POLICY_ADDRESS as `0x${string}`,
      mintingFee: BigInt(0),
      commercialRevShare: 500, // 5% = 500 basis points
    },
  });

  console.log('Episode registered as IP:', response.ipAssetId);
  return response.ipAssetId;
}
```

### 3. Register Clip as Derivative IP

```typescript
export async function registerClipAsDerivative(
  clip: {
    id: string;
    title: string;
    description: string;
    clipUrl: string;
    thumbnailUrl: string;
    startMs: number;
    endMs: number;
    tags: string[];
  },
  parentIpAssetId: string
) {
  // 1. Prepare clip metadata
  const metadata = {
    name: clip.title,
    description: clip.description,
    mediaType: 'audio/mpeg',
    mediaUrl: clip.clipUrl,
    image: clip.thumbnailUrl,
    external_url: `https://clipchain.io/clip/${clip.id}`,
    attributes: [
      { trait_type: 'Parent IP', value: parentIpAssetId },
      { trait_type: 'Start Time', value: clip.startMs },
      { trait_type: 'End Time', value: clip.endMs },
      { trait_type: 'Duration', value: clip.endMs - clip.startMs },
      { trait_type: 'Tags', value: clip.tags.join(', ') },
      { trait_type: 'Type', value: 'Podcast Clip' },
    ],
  };

  const ipfsHash = await uploadJSONToIPFS(metadata);
  const metadataURI = `ipfs://${ipfsHash}`;

  // 2. Register as derivative IP Asset
  const response = await storyClient.ipAsset.registerDerivative({
    parentIpIds: [parentIpAssetId as `0x${string}`],
    licenseTermsIds: [BigInt(process.env.LICENSE_TERMS_ID!)],
    nftContract: process.env.SPG_NFT_CONTRACT as `0x${string}`,
    tokenId: BigInt(generateTokenId()),
    metadata: {
      metadataURI,
      metadataHash: ipfsHash,
    },
  });

  console.log('Clip registered as derivative IP:', response.ipAssetId);
  return response.ipAssetId;
}
```

### 4. Attach License Terms

```typescript
export async function attachLicenseTerms(ipAssetId: string) {
  const response = await storyClient.license.attachLicenseTerms({
    ipId: ipAssetId as `0x${string}`,
    licenseTermsId: BigInt(process.env.LICENSE_TERMS_ID!),
  });

  console.log('License terms attached:', response.txHash);
  return response;
}
```

### 5. Mint License Token

```typescript
export async function mintLicenseForClip(
  clipIpAssetId: string,
  buyerAddress: string,
  quantity: number = 1
) {
  const response = await storyClient.license.mintLicenseTokens({
    licensorIpId: clipIpAssetId as `0x${string}`,
    licenseTermsId: BigInt(process.env.LICENSE_TERMS_ID!),
    amount: BigInt(quantity),
    receiver: buyerAddress as `0x${string}`,
    txOptions: {
      waitForTransaction: true,
    },
  });

  console.log('License minted:', response.licenseTokenIds);
  return response.licenseTokenIds;
}
```

### 6. Claim Revenue

```typescript
export async function claimRoyalties(ipAssetId: string, tokenAddress: string) {
  const response = await storyClient.royalty.claimRevenue({
    snapshotIds: [BigInt(1)], // Replace with actual snapshot IDs
    royaltyVaultIpId: ipAssetId as `0x${string}`,
    token: tokenAddress as `0x${string}`,
  });

  console.log('Royalties claimed:', response.claimableToken);
  return response;
}
```

---

## x402 Payment Integration

### Prerequisites

```bash
npm install x402
```

### 1. Setup x402 Client

```typescript
// lib/x402.ts
import { X402Client } from 'x402';

export const x402Client = new X402Client({
  network: process.env.X402_NETWORK as 'base' | 'base-sepolia',
  privateKey: process.env.X402_PRIVATE_KEY,
});
```

### 2. Create Payment Request

```typescript
import { x402Client } from '@/lib/x402';

export async function createPaymentRequest(params: {
  clipId: string;
  amount: number; // in USD cents
  buyerWallet: string;
  metadata?: Record<string, any>;
}) {
  const paymentRequest = await x402Client.createPayment({
    amount: params.amount,
    currency: 'USDC',
    recipient: process.env.BUSINESS_WALLET_ADDRESS!,
    metadata: {
      clipId: params.clipId,
      buyer: params.buyerWallet,
      ...params.metadata,
    },
  });

  console.log('Payment request created:', paymentRequest.paymentId);
  return paymentRequest;
}
```

### 3. Verify Payment

```typescript
export async function verifyPayment(paymentId: string) {
  const status = await x402Client.getPaymentStatus(paymentId);

  if (status.status === 'completed') {
    console.log('Payment confirmed:', status.txHash);
    return { confirmed: true, txHash: status.txHash };
  }

  return { confirmed: false };
}
```

### 4. Handle Payment Webhook

```typescript
// app/api/webhooks/x402/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { verifyX402Signature } from '@/lib/x402';

export async function POST(request: NextRequest) {
  const body = await request.json();
  const signature = request.headers.get('x-x402-signature');

  // Verify webhook signature
  const isValid = verifyX402Signature(body, signature);
  if (!isValid) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
  }

  const { event, data } = body;

  if (event === 'payment.completed') {
    // Payment successful - mint license
    await handlePaymentSuccess(data);
  } else if (event === 'payment.failed') {
    // Payment failed - notify user
    await handlePaymentFailure(data);
  }

  return NextResponse.json({ received: true });
}

async function handlePaymentSuccess(data: any) {
  const { paymentId, clipId, buyer, amount, txHash } = data;

  // 1. Mint license token via Story Protocol
  const licenseTokens = await mintLicenseForClip(clipId, buyer);

  // 2. Record transaction in database
  await prisma.licenseTransaction.create({
    data: {
      clipId,
      buyerWallet: buyer,
      amount,
      txHash,
      licenseTokenId: licenseTokens[0],
      status: 'COMPLETED',
    },
  });

  // 3. Distribute earnings
  await distributeEarnings(clipId, amount);

  console.log('License minted and earnings distributed');
}
```

---

## IPFS Integration

### Prerequisites

```bash
npm install ipfs-http-client
```

### 1. Setup IPFS Client

```typescript
// lib/ipfs.ts
import { create } from 'ipfs-http-client';

const ipfsClient = create({
  host: 'ipfs.infura.io',
  port: 5001,
  protocol: 'https',
  headers: {
    authorization: `Basic ${Buffer.from(
      `${process.env.IPFS_PROJECT_ID}:${process.env.IPFS_PROJECT_SECRET}`
    ).toString('base64')}`,
  },
});

export async function uploadJSONToIPFS(data: any): Promise<string> {
  const json = JSON.stringify(data);
  const result = await ipfsClient.add(json);
  return result.cid.toString();
}

export async function uploadFileToIPFS(file: File): Promise<string> {
  const buffer = await file.arrayBuffer();
  const result = await ipfsClient.add(Buffer.from(buffer));
  return result.cid.toString();
}

export async function fetchFromIPFS(cid: string): Promise<any> {
  const stream = ipfsClient.cat(cid);
  const chunks = [];
  for await (const chunk of stream) {
    chunks.push(chunk);
  }
  const data = Buffer.concat(chunks).toString('utf-8');
  return JSON.parse(data);
}
```

---

## Complete Licensing Flow Example

```typescript
// services/licensing.service.ts
import { storyClient } from '@/lib/storyProtocol';
import { x402Client } from '@/lib/x402';
import { prisma } from '@/lib/prisma';

export async function purchaseClipLicense(
  clipId: string,
  buyerWallet: string
): Promise<{
  licenseTokenId: string;
  txHash: string;
  transactionId: string;
}> {
  // 1. Fetch clip details
  const clip = await prisma.clip.findUnique({
    where: { id: clipId },
    include: {
      episode: {
        include: { user: true },
      },
    },
  });

  if (!clip) {
    throw new Error('Clip not found');
  }

  if (!clip.ipAssetId) {
    throw new Error('Clip not registered as IP asset');
  }

  // 2. Create payment request
  const payment = await x402Client.createPayment({
    amount: clip.licensePrice,
    currency: 'USDC',
    network: 'base',
    recipient: process.env.BUSINESS_WALLET_ADDRESS!,
    metadata: {
      type: 'clip_license',
      clipId: clip.id,
      buyer: buyerWallet,
      title: clip.title,
    },
  });

  console.log('Payment initiated:', payment.paymentId);

  // 3. Wait for payment confirmation (or handle via webhook)
  let attempts = 0;
  let paymentConfirmed = false;
  let txHash = '';

  while (attempts < 60 && !paymentConfirmed) {
    const status = await x402Client.getPaymentStatus(payment.paymentId);
    
    if (status.status === 'completed') {
      paymentConfirmed = true;
      txHash = status.txHash;
      break;
    }

    await new Promise(resolve => setTimeout(resolve, 1000));
    attempts++;
  }

  if (!paymentConfirmed) {
    throw new Error('Payment timeout');
  }

  // 4. Mint license token
  const licenseTokens = await storyClient.license.mintLicenseTokens({
    licensorIpId: clip.ipAssetId as `0x${string}`,
    licenseTermsId: BigInt(process.env.LICENSE_TERMS_ID!),
    amount: BigInt(1),
    receiver: buyerWallet as `0x${string}`,
    txOptions: {
      waitForTransaction: true,
    },
  });

  const licenseTokenId = licenseTokens.licenseTokenIds[0].toString();

  // 5. Record transaction
  const transaction = await prisma.licenseTransaction.create({
    data: {
      clipId: clip.id,
      buyerWallet,
      amount: clip.licensePrice,
      platformFee: clip.licensePrice * 0.05,
      txHash,
      licenseTokenId,
      status: 'COMPLETED',
    },
  });

  // 6. Distribute earnings
  await distributeEarnings(transaction);

  return {
    licenseTokenId,
    txHash,
    transactionId: transaction.id,
  };
}

async function distributeEarnings(transaction: LicenseTransaction) {
  const clip = await prisma.clip.findUnique({
    where: { id: transaction.clipId },
    include: { episode: { include: { user: true } } },
  });

  if (!clip) return;

  const netAmount = transaction.amount - transaction.platformFee;

  // Host earnings (70% default)
  const hostAmount = netAmount * (clip.episode.royaltyHost / 100);
  await prisma.earning.create({
    data: {
      userId: clip.episode.userId,
      clipId: clip.id,
      transactionId: transaction.id,
      amount: hostAmount,
      percentage: clip.episode.royaltyHost,
    },
  });

  // Guest earnings (25% default)
  if (clip.episode.royaltyGuest > 0) {
    const guestAmount = netAmount * (clip.episode.royaltyGuest / 100);
    // TODO: Get guest wallet from episode metadata
    // For now, log for manual processing
    console.log('Guest earning:', { amount: guestAmount, clipId: clip.id });
  }

  console.log('Earnings distributed:', transaction.id);
}
```

---

## Frontend Integration Example

### React Hook for License Purchase

```typescript
// hooks/usePurchaseLicense.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

export function usePurchaseLicense() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: { clipId: string; buyerWallet: string }) => {
      const response = await fetch('/api/clips/license', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message);
      }

      return response.json();
    },
    onSuccess: (data) => {
      toast.success('License purchased successfully!');
      queryClient.invalidateQueries({ queryKey: ['earnings'] });
    },
    onError: (error) => {
      toast.error(`Purchase failed: ${error.message}`);
    },
  });
}
```

### License Purchase Component

```typescript
// components/PurchaseLicenseButton.tsx
import { Button } from '@/components/ui/button';
import { usePurchaseLicense } from '@/hooks/usePurchaseLicense';
import { useWallet } from '@/hooks/useWallet';

export function PurchaseLicenseButton({ clipId, price }: { clipId: string; price: number }) {
  const { address, connect, isConnected } = useWallet();
  const purchaseLicense = usePurchaseLicense();

  const handlePurchase = async () => {
    if (!isConnected) {
      await connect();
      return;
    }

    purchaseLicense.mutate({
      clipId,
      buyerWallet: address!,
    });
  };

  return (
    <Button
      onClick={handlePurchase}
      disabled={purchaseLicense.isPending}
      className="bg-primary hover:bg-primary-hover"
    >
      {purchaseLicense.isPending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Processing...
        </>
      ) : (
        <>
          License for ${(price / 100).toFixed(2)}
        </>
      )}
    </Button>
  );
}
```

---

## Environment Configuration

```env
# Story Protocol
STORY_CHAIN_ID=1513
STORY_RPC_URL=https://rpc.story.foundation
STORY_PRIVATE_KEY=0x... # Your wallet private key
SPG_NFT_CONTRACT=0x... # Story Protocol NFT contract
ROYALTY_POLICY_ADDRESS=0x... # Royalty policy contract
LICENSE_TERMS_ID=1 # Default license terms

# x402 Payments
X402_NETWORK=base
BUSINESS_WALLET_ADDRESS=0x... # Your business wallet
X402_PRIVATE_KEY=0x... # Payment private key

# IPFS
IPFS_PROJECT_ID=your_infura_project_id
IPFS_PROJECT_SECRET=your_infura_secret
IPFS_GATEWAY=https://ipfs.io/ipfs/

# Database
DATABASE_URL=postgresql://...
```

---

## Testing

### Unit Tests

```typescript
// __tests__/licensing.test.ts
import { purchaseClipLicense } from '@/services/licensing.service';
import { prismaMock } from '@/lib/prisma.mock';

describe('License Purchase Flow', () => {
  it('should mint license and distribute earnings', async () => {
    const mockClip = {
      id: 'clip-1',
      ipAssetId: '0x123...',
      licensePrice: 500, // $5.00
      episode: {
        royaltyHost: 70,
        royaltyGuest: 25,
        userId: 'user-1',
      },
    };

    prismaMock.clip.findUnique.mockResolvedValue(mockClip);

    const result = await purchaseClipLicense('clip-1', '0xbuyer...');

    expect(result.licenseTokenId).toBeDefined();
    expect(prismaMock.earning.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          amount: 332.5, // 70% of $4.75 (after 5% platform fee)
        }),
      })
    );
  });
});
```

---

## Troubleshooting

### Common Issues

1. **"IP Asset not found"**
   - Ensure `ipAssetId` is set after registration
   - Verify Story Protocol RPC connection

2. **Payment timeout**
   - Check x402 network status
   - Verify buyer has sufficient USDC balance

3. **License minting fails**
   - Ensure license terms are attached to IP asset
   - Check wallet gas balance

4. **IPFS upload slow**
   - Consider using a dedicated IPFS pinning service
   - Implement caching for metadata

---

## Additional Resources

- [Story Protocol Docs](https://docs.story.foundation)
- [x402 Documentation](https://x402.gitbook.io)
- [IPFS Documentation](https://docs.ipfs.tech)
- [Viem Documentation](https://viem.sh)
