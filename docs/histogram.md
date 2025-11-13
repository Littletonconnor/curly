# Histogram Bucketing Logic Explained

## What is a Histogram?

A histogram groups similar values together into "buckets" (like putting items into boxes) so you can see how your data is distributed. Think of it like sorting M&Ms by color - you're grouping similar things together to see the pattern.

## The Goal

We want to take a bunch of response times (like `[0.109s, 0.115s, 0.120s, 0.250s, 0.430s]`) and group them into 10 evenly-spaced buckets, then show how many requests fall into each bucket.

## Step-by-Step Breakdown

### Step 1: Find the Range

First, we need to know the full span of our data:

```
min = 0.109 seconds (fastest request)
max = 0.430 seconds (slowest request)
range = max - min = 0.430 - 0.109 = 0.321 seconds
```

**Think of it like:** If you're measuring heights of people, you find the shortest person (min) and tallest person (max), then calculate how much difference there is between them (range).

### Step 2: Divide into Equal Buckets

We want 10 buckets, so we divide the range equally:

```
bucketSize = range / 10
bucketSize = 0.321 / 10 = 0.0321 seconds per bucket
```

**Think of it like:** You have a 0.321 meter long shelf, and you want to divide it into 10 equal sections. Each section is 0.0321 meters wide.

### Step 3: Calculate Where Each Bucket Starts

Each bucket starts at a specific point. The first bucket starts at `min`, and each subsequent bucket starts `bucketSize` further along:

```
Bucket 0 starts at: min + (0 × bucketSize) = 0.109 + 0 = 0.109s
Bucket 1 starts at: min + (1 × bucketSize) = 0.109 + 0.0321 = 0.141s
Bucket 2 starts at: min + (2 × bucketSize) = 0.109 + 0.0642 = 0.173s
Bucket 3 starts at: min + (3 × bucketSize) = 0.109 + 0.0963 = 0.205s
... and so on
```

**Think of it like:** Marking lines on a ruler at equal intervals. The first mark is at the start, then you mark every 0.0321 units.

### Step 4: Assign Each Duration to a Bucket

For each response time, we figure out which bucket it belongs to. Here's the magic formula:

```javascript
bucketIndex = Math.floor((duration - min) / bucketSize)
```

**Breaking this down:**

1. `duration - min` = How far is this value from the start?

   - Example: If duration is `0.150s` and min is `0.109s`
   - Then: `0.150 - 0.109 = 0.041s` (it's 0.041 seconds away from the start)

2. `(duration - min) / bucketSize` = How many bucket-widths away is it?

   - Example: `0.041 / 0.0321 = 1.28` (it's 1.28 bucket-widths away)

3. `Math.floor(...)` = Round down to get the bucket number
   - Example: `Math.floor(1.28) = 1` (it goes in bucket 1)

**Visual Example:**

```
Timeline:  [0.109]----[0.141]----[0.173]----[0.205]----...
           Bucket 0  Bucket 1   Bucket 2   Bucket 3

Duration 0.150s:
  - Distance from start: 0.150 - 0.109 = 0.041
  - Bucket widths: 0.041 / 0.0321 = 1.28
  - Bucket number: Math.floor(1.28) = 1
  - Result: Goes in Bucket 1 ✓

Duration 0.250s:
  - Distance from start: 0.250 - 0.109 = 0.141
  - Bucket widths: 0.141 / 0.0321 = 4.39
  - Bucket number: Math.floor(4.39) = 4
  - Result: Goes in Bucket 4 ✓
```

### Step 5: Handle Edge Cases

Sometimes a value might be exactly at the max, or due to floating-point math, it might calculate to bucket 10 (which doesn't exist). We handle this:

```javascript
const finalIndex = bucketIndex >= numBuckets ? numBuckets - 1 : bucketIndex
```

**What this does:** If the calculated bucket is 10 or higher, put it in the last bucket (bucket 9). This ensures the maximum value always fits.

**Think of it like:** If you're sorting items and one falls just outside your last box, you put it in the last box anyway.

### Step 6: Count Items in Each Bucket

We create an array of 10 zeros, then increment the count for each bucket as we assign durations:

```javascript
buckets = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0] // Start with all zeros

// After processing durations:
buckets = [37, 0, 12, 0, 1, 8, 10, 18, 13, 1]
// 37 requests in bucket 0, 0 in bucket 1, 12 in bucket 2, etc.
```

### Step 7: Normalize Bar Lengths

To draw the visual bars, we need to scale them. The longest bar should be 40 characters, and all others scale proportionally:

```javascript
maxCount = 37 // The bucket with the most items
barLength = Math.round((count / maxCount) * 40)
```

**Example:**

- Bucket with 37 items: `(37 / 37) × 40 = 40` characters (full bar)
- Bucket with 18 items: `(18 / 37) × 40 = 19.46 ≈ 19` characters
- Bucket with 1 item: `(1 / 37) × 40 = 1.08 ≈ 1` character

**Think of it like:** Making a bar chart where the tallest bar fills the full width, and all other bars are scaled proportionally.

## Real Example Walkthrough

Let's say we have these durations: `[0.109, 0.115, 0.120, 0.250, 0.430]`

1. **Find range:**

   - min = 0.109, max = 0.430
   - range = 0.321

2. **Calculate bucket size:**

   - bucketSize = 0.321 / 10 = 0.0321

3. **Assign each duration:**

   - `0.109`: `(0.109 - 0.109) / 0.0321 = 0` → Bucket 0
   - `0.115`: `(0.115 - 0.109) / 0.0321 = 0.187` → Bucket 0 (Math.floor(0.187) = 0)
   - `0.120`: `(0.120 - 0.109) / 0.0321 = 0.343` → Bucket 0 (Math.floor(0.343) = 0)
   - `0.250`: `(0.250 - 0.109) / 0.0321 = 4.39` → Bucket 4 (Math.floor(4.39) = 4)
   - `0.430`: `(0.430 - 0.109) / 0.0321 = 10.0` → Bucket 9 (clamped to last bucket)

4. **Result:**
   - Bucket 0: 3 items
   - Bucket 4: 1 item
   - Bucket 9: 1 item
   - All other buckets: 0 items

## Key Concepts Summary

- **Range**: The total span from minimum to maximum value
- **Bucket Size**: How wide each bucket is (range divided by number of buckets)
- **Bucket Index**: Which bucket a value belongs to (calculated by how many bucket-widths it is from the start)
- **Math.floor()**: Rounds down to get whole bucket numbers
- **Normalization**: Scaling bar lengths so the tallest bar fills the available width

## Why This Works

The formula `(duration - min) / bucketSize` works because:

1. `duration - min` tells you "how far from the start"
2. Dividing by `bucketSize` converts that distance into "how many bucket-widths"
3. `Math.floor()` gives you the bucket number (since buckets are numbered 0, 1, 2, etc.)

It's like asking: "If I'm 0.041 meters along a 0.321 meter shelf divided into 10 sections, which section am I in?" The answer is section 1 (the second section, since we start counting at 0).
